import { useEffect, useRef, useState } from 'react';

export type TikfinityData = any;

export interface TikfinityWidgetProps {
  cid: string;
  apiBaseUrl?: string;
  iframePath?: string;
  timeoutMs?: number;
  onError?: (err: Error | string) => void;
  onMessage?: (data: TikfinityData) => void;
  onAnswerSubmitted?: (answer: 'A' | 'B' | 'C' | 'D', username: string) => void;
  className?: string;
  demoMode?: boolean; // Enable demo answers for testing
}

export default function TikfinityWidget({
  cid,
  apiBaseUrl = 'https://tikfinity.zerody.one',
  iframePath = '/widget/chat',
  timeoutMs = 7000,
  onError,
  onMessage,
  onAnswerSubmitted,
  className,
  demoMode = false,
}: TikfinityWidgetProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [data, setData] = useState<TikfinityData | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const lastMessagesRef = useRef<Set<string>>(new Set());
  const demoIntervalRef = useRef<number | null>(null);

  const origin = (() => {
    try {
      return new URL(apiBaseUrl).origin;
    } catch (e) {
      return apiBaseUrl;
    }
  })();

  useEffect(() => {
    if (!cid) return;
    setStatus('loading');

    function onMessageEvent(e: MessageEvent) {
      // Accept only messages from the widget origin
      if (!e.origin || !origin || e.origin !== origin) return;
      const payload = e.data;
      if (!payload) return;
      if (payload.cid && payload.cid !== cid) return;

      // Extract and filter chat messages for A/B/C/D answers
      if (payload.messages && Array.isArray(payload.messages)) {
        payload.messages.forEach((msg: any) => {
          const msgId = `${msg.user || msg.username || 'anon'}_${msg.timestamp || msg.id || Math.random()}`;
          if (!lastMessagesRef.current.has(msgId)) {
            lastMessagesRef.current.add(msgId);
            
            const text = (msg.text || msg.content || '').trim().toUpperCase();
            if (['A', 'B', 'C', 'D'].includes(text)) {
              console.log(`[TikfinityWidget] Answer from ${msg.user || msg.username}: ${text}`);
              onAnswerSubmitted?.(text as 'A' | 'B' | 'C' | 'D', msg.user || msg.username || 'Anonim');
            }
          }
        });
      }

      setData(payload);
      setStatus('ready');
      onMessage?.(payload);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    window.addEventListener('message', onMessageEvent as any);

    // Setup a fallback: if iframe doesn't respond in time, try direct fetch
    timeoutRef.current = window.setTimeout(async () => {
      try {
        const url = `${apiBaseUrl}/widget/data?cid=${encodeURIComponent(cid)}`;
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const json = await res.json();
        setData(json);
        setStatus('ready');
        onMessage?.(json);
      } catch (err: any) {
        setStatus('error');
        onError?.(err);
      }
    }, timeoutMs);

    return () => {
      window.removeEventListener('message', onMessageEvent as any);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [cid, apiBaseUrl, timeoutMs, onError, onMessage, onAnswerSubmitted, origin]);

  const iframeSrc = `${apiBaseUrl.replace(/\/$/, '')}${iframePath}?cid=${encodeURIComponent(cid)}`;

  const handleLoad = () => {
    // After iframe loads, send an init message requesting data
    try {
      iframeRef.current?.contentWindow?.postMessage({ type: 'init', cid }, origin);
    } catch (e) {
      // ignore
    }
  };

  // Demo mode: simulate answers
  useEffect(() => {
    if (!demoMode) return;

    demoIntervalRef.current = window.setInterval(() => {
      const users = ['Ali', 'Ayşe', 'Can', 'Deniz', 'Ece', 'Fatih', 'Gül', 'Hakan'];
      const answers: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
      
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
      
      console.log(`[Demo] ${randomUser} → ${randomAnswer}`);
      onAnswerSubmitted?.(randomAnswer, randomUser);
    }, 500);

    return () => {
      if (demoIntervalRef.current) {
        window.clearInterval(demoIntervalRef.current);
      }
    };
  }, [demoMode, onAnswerSubmitted]);

  return (
    <div className={className}>
      <div style={{ border: '1px solid #ddd', borderRadius: 6, overflow: 'hidden' }}>
        <iframe
          ref={iframeRef}
          title={`tikfinity-widget-${cid}`}
          src={iframeSrc}
          style={{ width: '100%', height: 400, border: 'none' }}
          onLoad={handleLoad}
        />
      </div>

      <div style={{ marginTop: 8 }}>
        {status === 'loading' && <div>Yükleniyor…</div>}
        {status === 'ready' && data && (
          <div>
            <strong>Veri alındı</strong>
            <pre style={{ maxHeight: 160, overflow: 'auto', background: '#f9f9f9', padding: 8, fontSize: '12px' }}>
              {JSON.stringify(data, null, 2).substring(0, 200)}...
            </pre>
          </div>
        )}
        {status === 'error' && <div style={{ color: 'red' }}>Veri alınamadı.</div>}
        {demoMode && <div style={{ marginTop: 8, color: '#667eea', fontSize: '12px', fontWeight: 600 }}>🔄 Demo Mode Aktif</div>}
      </div>
    </div>
  );
}

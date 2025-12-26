export interface GameSettings {
  questionTimerSeconds: number; // 30 saniye varsayılan
  showTopPlayers: number; // kaç kişi göster (ilk 3)
  enableTTS: boolean;
  ttsLanguage: 'tr-TR' | 'en-US';
  ttsRate: number; // 0.5 - 2.0
  ttsVolume: number; // 0.0 - 1.0
  ttsVoice?: SpeechSynthesisVoice;
}

export interface TTSSettings {
  enabled: boolean;
  language: 'tr-TR' | 'en-US';
  rate: number; // 0.5 - 2.0, default 1.0
  pitch: number; // 0.5 - 2.0, default 1.0
  volume: number; // 0.0 - 1.0, default 1.0
  voice?: string; // voice identifier
}

// LocalStorage defaults
const DEFAULT_SETTINGS: GameSettings = {
  questionTimerSeconds: 30,
  showTopPlayers: 3,
  enableTTS: true,
  ttsLanguage: 'tr-TR',
  ttsRate: 1.0,
  ttsVolume: 1.0,
};

const DEFAULT_TTS_SETTINGS: TTSSettings = {
  enabled: true,
  language: 'tr-TR',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

export function getGameSettings(): GameSettings {
  try {
    const saved = localStorage.getItem('gameSettings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveGameSettings(settings: Partial<GameSettings>) {
  const current = getGameSettings();
  localStorage.setItem('gameSettings', JSON.stringify({ ...current, ...settings }));
}

export function getTTSSettings(): TTSSettings {
  try {
    const saved = localStorage.getItem('ttsSettings');
    return saved ? { ...DEFAULT_TTS_SETTINGS, ...JSON.parse(saved) } : DEFAULT_TTS_SETTINGS;
  } catch {
    return DEFAULT_TTS_SETTINGS;
  }
}

export function saveTTSSettings(settings: Partial<TTSSettings>) {
  const current = getTTSSettings();
  localStorage.setItem('ttsSettings', JSON.stringify({ ...current, ...settings }));
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  const voices = window.speechSynthesis.getVoices();
  return voices;
}

export function getTurkishVoices(): SpeechSynthesisVoice[] {
  return getAvailableVoices().filter(v => v.lang.startsWith('tr'));
}

export function getEnglishVoices(): SpeechSynthesisVoice[] {
  return getAvailableVoices().filter(v => v.lang.startsWith('en'));
}

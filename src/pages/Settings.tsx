import { useState, useEffect } from 'react';
import { getGameSettings, saveGameSettings, getTTSSettings, saveTTSSettings, getTurkishVoices, getEnglishVoices } from '../config/settings';
import { ttsEngine } from '../config/tts';
import './Settings.css';

export default function Settings() {
  const [gameSettings, setGameSettings] = useState(getGameSettings());
  const [ttsSettings, setTTSSettings] = useState(getTTSSettings());
  const [testSpeaking, setTestSpeaking] = useState(false);

  useEffect(() => {
    // Load voices when component mounts
    const loadVoices = () => {
      getTurkishVoices();
      getEnglishVoices();
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    } else {
      loadVoices();
    }
  }, []);

  const handleGameSettingChange = (key: string, value: any) => {
    const updated = { ...gameSettings, [key]: value };
    setGameSettings(updated as any);
    saveGameSettings({ [key]: value });
  };

  const handleTTSSettingChange = (key: string, value: any) => {
    const updated = { ...ttsSettings, [key]: value };
    setTTSSettings(updated as any);
    saveTTSSettings({ [key]: value });
  };

  const handleTestTTS = () => {
    setTestSpeaking(true);
    const testText = ttsSettings.language === 'tr-TR' 
      ? 'Bu bir ses testi. Ayarları başarıyla güncellediniz.'
      : 'This is a voice test. You have successfully updated the settings.';
    
    ttsEngine.speak(testText, () => setTestSpeaking(false));
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>⚙️ Oyun Ayarları</h1>
        <p>Oyunun nasıl çalışacağını kişiselleştir</p>
      </div>

      <div className="settings-container">
        {/* Game Settings Section */}
        <div className="settings-section">
          <h2>🎮 Oyun Ayarları</h2>

          <div className="setting-item">
            <label>Soru Süresi (saniye)</label>
            <div className="input-group">
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={gameSettings.questionTimerSeconds}
                onChange={(e) => handleGameSettingChange('questionTimerSeconds', parseInt(e.target.value))}
                className="slider"
              />
              <span className="value-display">{gameSettings.questionTimerSeconds}s</span>
            </div>
            <p className="help-text">Her soru için kaç saniye süre olacağını belirle (varsayılan: 30s)</p>
          </div>

          <div className="setting-item">
            <label>Gösterilecek En İyi Oyuncu Sayısı</label>
            <div className="input-group">
              <select
                value={gameSettings.showTopPlayers}
                onChange={(e) => handleGameSettingChange('showTopPlayers', parseInt(e.target.value))}
                className="select-input"
              >
                <option value={1}>1 kişi</option>
                <option value={3}>3 kişi</option>
                <option value={5}>5 kişi</option>
                <option value={10}>10 kişi</option>
              </select>
            </div>
            <p className="help-text">Oyun sonu ekranında kaç kişinin en iyi cevabını gösterelim</p>
          </div>
        </div>

        {/* TTS Settings Section */}
        <div className="settings-section">
          <h2>🔊 Ses Ayarları (TTS)</h2>

          <div className="setting-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={ttsSettings.enabled}
                onChange={(e) => handleTTSSettingChange('enabled', e.target.checked)}
              />
              <span>Text-to-Speech'i Etkinleştir</span>
            </label>
            <p className="help-text">Soruların ve sonuçların sesli olarak okunmasını sağla</p>
          </div>

          {ttsSettings.enabled && (
            <>
              <div className="setting-item">
                <label>Dil</label>
                <div className="input-group">
                  <select
                    value={ttsSettings.language}
                    onChange={(e) => handleTTSSettingChange('language', e.target.value)}
                    className="select-input"
                  >
                    <option value="tr-TR">Türkçe</option>
                    <option value="en-US">İngilizce</option>
                  </select>
                </div>
              </div>

              <div className="setting-item">
                <label>Ses Hızı ({ttsSettings.rate.toFixed(1)}x)</label>
                <div className="input-group">
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={ttsSettings.rate}
                    onChange={(e) => handleTTSSettingChange('rate', parseFloat(e.target.value))}
                    className="slider"
                  />
                </div>
                <p className="help-text">Ses okuma hızını ayarla (0.5 = yavaş, 1.0 = normal, 2.0 = hızlı)</p>
              </div>

              <div className="setting-item">
                <label>Ton ({ttsSettings.pitch.toFixed(1)}x)</label>
                <div className="input-group">
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={ttsSettings.pitch}
                    onChange={(e) => handleTTSSettingChange('pitch', parseFloat(e.target.value))}
                    className="slider"
                  />
                </div>
                <p className="help-text">Sesin tonunu ayarla (0.5 = kalın, 1.0 = normal, 2.0 = ince)</p>
              </div>

              <div className="setting-item">
                <label>Ses Seviyesi ({Math.round(ttsSettings.volume * 100)}%)</label>
                <div className="input-group">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={ttsSettings.volume}
                    onChange={(e) => handleTTSSettingChange('volume', parseFloat(e.target.value))}
                    className="slider"
                  />
                </div>
              </div>

              <div className="setting-item">
                <button 
                  className="test-button"
                  onClick={handleTestTTS}
                  disabled={testSpeaking}
                >
                  {testSpeaking ? '🔊 Oynatılıyor...' : '🔊 Ses Testi Yap'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="settings-section info-section">
          <h2>ℹ️ Bilgiler</h2>
          <ul>
            <li>30 saniyede bir soru değişir (ayarlanabilir)</li>
            <li>Chat'ten sadece A, B, C, D karakterleri kabul edilir</li>
            <li>Yüzdelik bar, soruya verilen cevapların dağılımını gösterir</li>
            <li>Doğru cevaplayan ilk oyuncular sonunda gösterilir</li>
            <li>TTS, soruları ve sonuçları otomatik olarak sesli okur</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

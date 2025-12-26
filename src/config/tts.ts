import { getTTSSettings } from './settings';

export class TTSEngine {
  private synth: SpeechSynthesis;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  speak(text: string, onEnd?: () => void): void {
    if (!this.synth) return;

    // Cancel any ongoing speech
    this.synth.cancel();

    const settings = getTTSSettings();
    if (!settings.enabled) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = settings.language;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    // Try to set voice if available
    const voices = this.synth.getVoices();
    if (voices.length > 0) {
      const preferredVoices = voices.filter(v => v.lang === settings.language);
      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0];
      }
    }

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.synth.speak(utterance);
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  pause(): void {
    if (this.synth && this.synth.paused === false) {
      this.synth.pause();
    }
  }

  resume(): void {
    if (this.synth && this.synth.paused === true) {
      this.synth.resume();
    }
  }

  isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}

export const ttsEngine = new TTSEngine();

export type TextToSpeechOptions = {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceName?: string;
};

export type SpeechState = 'idle' | 'playing' | 'unsupported' | 'error';

const isBrowser = typeof window !== 'undefined';
const isSupported =
  isBrowser &&
  'speechSynthesis' in window &&
  typeof SpeechSynthesisUtterance !== 'undefined';

function chooseVoice(voices: SpeechSynthesisVoice[], voiceName?: string): SpeechSynthesisVoice | null {
  if (!voices.length) {
    return null;
  }

  if (voiceName) {
    const matched = voices.find((voice) => voice.name === voiceName || voice.voiceURI === voiceName);
    if (matched) {
      return matched;
    }
  }

  const preferredLocale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  const localeMatch = voices.find((voice) => voice.lang.toLowerCase().startsWith(preferredLocale.toLowerCase()));
  return localeMatch || voices[0] || null;
}

export class TextToSpeechService {
  private utterance: SpeechSynthesisUtterance | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private state: SpeechState = isSupported ? 'idle' : 'unsupported';
  private stateChangeCallback: ((state: SpeechState) => void) | null = null;

  constructor() {
    if (!isSupported) {
      return;
    }

    this.populateVoice();
    window.speechSynthesis.addEventListener('voiceschanged', this.populateVoice);
  }

  private populateVoice = (): void => {
    if (!isSupported) {
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      this.voice = chooseVoice(voices, undefined);
    }
  };

  public onStateChange(callback: (state: SpeechState) => void): void {
    this.stateChangeCallback = callback;
  }

  private setState(state: SpeechState): void {
    this.state = state;
    if (this.stateChangeCallback) {
      this.stateChangeCallback(state);
    }
  }

  public getSupported(): boolean {
    return isSupported;
  }

  public getState(): SpeechState {
    return this.state;
  }

  public speak(text: string, options: TextToSpeechOptions = {}): void {
    if (!isSupported || !text.trim()) {
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = options.lang || (typeof navigator !== 'undefined' ? navigator.language || 'en-US' : 'en-US');
    utterance.rate = options.rate ?? 1;
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;

    if (this.voice) {
      utterance.voice = this.voice;
    }

    utterance.addEventListener('start', () => {
      this.utterance = utterance;
      this.setState('playing');
    });

    utterance.addEventListener('end', () => {
      this.utterance = null;
      this.setState('idle');
    });

    utterance.addEventListener('error', (errorEvent) => {
      console.error('TextToSpeech error:', errorEvent.error || errorEvent);
      this.utterance = null;
      this.setState('error');
    });

    window.speechSynthesis.speak(utterance);
  }

  public stop(): void {
    if (!isSupported) {
      return;
    }

    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }

    this.utterance = null;
    this.setState('idle');
  }
}

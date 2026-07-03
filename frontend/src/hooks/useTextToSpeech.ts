import { useCallback, useEffect, useMemo, useState } from 'react';
import { TextToSpeechOptions, TextToSpeechService, SpeechState } from '../services/textToSpeech';

const speechService = new TextToSpeechService();

type UseTextToSpeechResult = {
  supported: boolean;
  state: SpeechState;
  muted: boolean;
  latestReply: string;
  speak: (text: string, options?: TextToSpeechOptions) => void;
  stop: () => void;
  playAgain: () => void;
  setMuted: (value: boolean) => void;
};

function useTextToSpeech(): UseTextToSpeechResult {
  const [state, setState] = useState<SpeechState>(speechService.getState());
  const [muted, setMuted] = useState(false);
  const [latestReply, setLatestReply] = useState('');
  const supported = useMemo(() => speechService.getSupported(), []);

  useEffect(() => {
    speechService.onStateChange(setState);
    return () => {
      speechService.onStateChange(() => undefined);
    };
  }, []);

  useEffect(() => {
    if (muted) {
      speechService.stop();
    }
  }, [muted]);

  const speak = useCallback((text: string, options?: TextToSpeechOptions) => {
    const trimmedText = text.trim();
    if (!supported || muted || !trimmedText) {
      setLatestReply(trimmedText);
      return;
    }

    setLatestReply(trimmedText);
    speechService.speak(trimmedText, options);
  }, [muted, supported]);

  const stop = useCallback(() => {
    if (!supported) {
      return;
    }
    speechService.stop();
  }, [supported]);

  const playAgain = useCallback(() => {
    if (!supported || !latestReply.trim()) {
      return;
    }
    speechService.speak(latestReply, { lang: typeof navigator !== 'undefined' ? navigator.language || 'en-US' : 'en-US' });
  }, [latestReply, supported]);

  return {
    supported,
    state,
    muted,
    latestReply,
    speak,
    stop,
    playAgain,
    setMuted,
  };
}

export default useTextToSpeech;

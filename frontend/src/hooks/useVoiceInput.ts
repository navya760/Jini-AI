import { useEffect, useRef, useState } from 'react';

type MediaData = {
  base64: string;
  mimeType: string;
};

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function useVoiceInput() {
  const [isRecording, setIsRecording] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
const analyserRef = useRef<AnalyserNode | null>(null);
const silenceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setSupported(
      typeof navigator !== 'undefined' &&
        typeof window !== 'undefined' &&
        'mediaDevices' in navigator &&
        'getUserMedia' in navigator.mediaDevices &&
        typeof MediaRecorder !== 'undefined',
    );
  }, []);

  const startSilenceDetection = () => {
  const analyser = analyserRef.current;
  if (!analyser) return;

  const dataArray = new Uint8Array(analyser.fftSize);

  const checkSilence = () => {
    if (!isRecording) return;

    analyser.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const value = (dataArray[i] - 128) / 128;
      sum += value * value;
    }

    const volume = Math.sqrt(sum / dataArray.length);

    // आवाज कमी असेल
    if (volume < 0.02) {
      if (!silenceTimerRef.current) {
        silenceTimerRef.current = window.setTimeout(async () => {
          await stopRecording();
        }, 2000); // 2 sec silence
      }
    } else {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    }

    requestAnimationFrame(checkSilence);
  };

  checkSilence();
};

  const startRecording = async () => {
    if (!supported) {
      setError('Voice recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new AudioContext();
audioContextRef.current = audioContext;

const source = audioContext.createMediaStreamSource(stream);
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;

source.connect(analyser);
analyserRef.current = analyser;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      recorderRef.current = recorder;

      recorder.addEventListener('dataavailable', (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      });

      recorder.start();
      startSilenceDetection();
      setIsRecording(true);
      setError(null);
    } catch (exception) {
      setError('Unable to start the microphone. Please grant permissions.');
      console.error('Voice input error:', exception);
    }
  };

  const stopRecording = async (): Promise<MediaData | null> => {
    if (!recorderRef.current) {
      return null;
    }

    const recorder = recorderRef.current;

    return new Promise((resolve) => {
      recorder.addEventListener(
        'stop',
        async () => {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
          const base64 = await toBase64(blob);
          setIsRecording(false);
          recorderRef.current = null;

          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }
if (silenceTimerRef.current) {
  clearTimeout(silenceTimerRef.current);
  silenceTimerRef.current = null;
}

if (audioContextRef.current) {
  audioContextRef.current.close();
  audioContextRef.current = null;
}
          resolve({ base64, mimeType: recorder.mimeType || 'audio/webm' });
        },
        { once: true },
      );

      recorder.stop();
    });
  };

  return {
    isRecording,
    supported,
    error,
    startRecording,
    stopRecording,
    onAutoStop: stopRecording
  };
}

export default useVoiceInput;

import { useEffect, useState } from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import VoiceButton from './components/VoiceButton';
import SpeechControls from './components/SpeechControls';
import useVoiceInput from './hooks/useVoiceInput';
import useTextToSpeech from './hooks/useTextToSpeech';
import { webSocketService } from './services/websocket';
import { ChatMessage, WSClientMessage, WSResponseMessage } from './types/assistant';

const DEFAULT_SESSION_ID = 'default';

function App() {
  const [connected, setConnected] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'system', text: 'Connecting to Jini AI...' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

const {
  isRecording,
  supported,
  error,
  startRecording,
  stopRecording,
  onAutoStop,
} = useVoiceInput();  const {
    supported: speechSupported,
    state: speechState,
    muted,
    latestReply,
    speak,
    stop: stopSpeech,
    playAgain,
    setMuted,
  } = useTextToSpeech();

  useEffect(() => {
    const initializeWebSocket = async () => {
      webSocketService.on('open', () => {
        setConnected(true);
        setMessages((current) => [
          ...current,
          { sender: 'system', text: 'Connected to Jini AI 🟢' },
        ]);
      });

      webSocketService.on('message', (message: string | WSResponseMessage) => {
        handleBackendMessage(message);
      });

      webSocketService.on('close', () => {
        setConnected(false);
        setMessages((current) => [
          ...current,
          { sender: 'system', text: 'Disconnected from Jini AI. Please refresh to reconnect.' },
        ]);
      });

      webSocketService.on('error', (event: any) => {
        console.error('WebSocket error:', event);
        setConnected(false);
        setMessages((current) => [
          ...current,
          { sender: 'system', text: 'Connection error. Check the backend and try again.' },
        ]);
      });

      try {
        await webSocketService.connect();
      } catch (connectError) {
        setConnected(false);
        setMessages((current) => [
          ...current,
          {
            sender: 'system',
            text: 'Unable to connect. Confirm FastAPI backend is running at ws://127.0.0.1:8001/ws',
          },
        ]);
      }
    };

    initializeWebSocket();
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (error) {
      setMessages((current) => [...current, { sender: 'system', text: error }] );
    }
  }, [error]);

  const appendMessage = (message: ChatMessage) => {
    setMessages((current) => [...current, message]);
  };

  const appendAiResponse = (text: string) => {
    appendMessage({ sender: 'ai', text });
    speak(text);
  };

  const handleBackendMessage = (message: WSResponseMessage | string) => {
    setIsLoading(false);

    if (typeof message === 'string') {
      appendAiResponse(message);
      return;
    }

    if (message.type === 'assistant.response') {
      appendAiResponse(message.payload.message);
      return;
    }

    if (message.type === 'assistant.error') {
      appendMessage({ sender: 'system', text: `Error: ${message.payload.message}` });
      return;
    }

    if (message.payload?.message) {
      appendAiResponse(message.payload.message);
      return;
    }

    appendMessage({ sender: 'system', text: 'Received an unexpected response from the assistant.' });
  };

  const sendTextMessage = (text: string) => {
    if (!connected || isLoading) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    appendMessage({ sender: 'user', text: trimmed });
    setInput('');
    setIsLoading(true);

    const payload: WSClientMessage = {
      type: 'text',
      payload: { message: trimmed },
      sessionId: DEFAULT_SESSION_ID,
    };

    webSocketService.sendMessage(payload);
  };

  const handleSend = () => {
    sendTextMessage(input);
  };
const sendVoiceMessage = async () => {
  const audioData = await stopRecording();

  if (!audioData) {
    appendMessage({
      sender: "system",
      text: "No audio captured. Please try again.",
    });
    return;
  }

  appendMessage({
    sender: "user",
    text: "Voice message sent to Jini AI…",
  });

  setIsLoading(true);

  const payload: WSClientMessage = {
    type: "voice",
    payload: {
      audio: audioData.base64,
      mimeType: audioData.mimeType,
    },
    sessionId: DEFAULT_SESSION_ID,
  };

  webSocketService.sendMessage(payload);
};
  const handleVoiceToggle = async () => {
    if (!supported) {
      appendMessage({ sender: 'system', text: 'Voice recording is not supported in this browser.' });
      return;
    }

    if (isRecording) {
      const audioData = await stopRecording();
      if (!audioData) {
        appendMessage({ sender: 'system', text: 'No audio captured. Please try again.' });
        return;
      }

      appendMessage({ sender: 'user', text: 'Voice message sent to Jini AI…' });
      setIsLoading(true);

      const payload: WSClientMessage = {
        type: 'voice',
        payload: {
          audio: audioData.base64,
          mimeType: audioData.mimeType,
        },
        sessionId: DEFAULT_SESSION_ID,
      };

      webSocketService.sendMessage(payload);
      return;
    }

    await startRecording();
    appendMessage({ sender: 'system', text: 'Listening... Speak naturally into your microphone.' });
  };

  return (
    <div className="app-shell">
      <div className="app-card">
        <Header connected={connected} />
        <ChatWindow messages={messages} />
        <SpeechControls
          supported={speechSupported}
          state={speechState}
          muted={muted}
          latestReply={latestReply}
          onToggleMute={() => setMuted(!muted)}
          onStop={stopSpeech}
          onPlayAgain={playAgain}
        />
        <div className="chat-actions">
          <VoiceButton
            active={isRecording}
            disabled={!connected || isLoading}
            onStart={handleVoiceToggle}
            onStop={handleVoiceToggle}
          />
          <ChatInput value={input} onChange={setInput} onSend={handleSend} disabled={!connected || isLoading} />
        </div>
      </div>
    </div>
  );
}

export default App;


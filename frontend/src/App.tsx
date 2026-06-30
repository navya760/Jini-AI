import { useState, useEffect } from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import { webSocketService } from './services/websocket';

type ChatMessage = {
  sender: 'user' | 'ai' | 'system';
  text: string;
};

function App() {
  const [connected, setConnected] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'system', text: 'Connecting to Jini AI...' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Connect to WebSocket when app loads
  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        // Register event callbacks
        webSocketService.on('onOpen', () => {
          console.log('✅ Connected to Jini AI');
          setConnected(true);
          setMessages((current) => [
            ...current,
            { sender: 'system', text: 'Connected to Jini AI! 🟢' },
          ]);
        });

        webSocketService.on('onMessage', (data) => {
          console.log('📩 Message received:', data);
          // Handle backend reply
          handleBackendMessage(data);
          setIsLoading(false);
        });

        webSocketService.on('onClose', () => {
          console.log('❌ Disconnected from Jini AI');
          setConnected(false);
          setMessages((current) => [
            ...current,
            { sender: 'system', text: 'Disconnected from Jini AI. Refresh to reconnect.' },
          ]);
        });

        webSocketService.on('onError', (error) => {
          console.error('⚠️ WebSocket error:', error);
          setConnected(false);
          setMessages((current) => [
            ...current,
            { sender: 'system', text: '❌ Connection error. Please check if the server is running.' },
          ]);
        });

        // Connect to WebSocket
        await webSocketService.connect();
      } catch (error) {
        console.error('Failed to connect:', error);
        setConnected(false);
        setMessages((current) => [
          ...current,
          {
            sender: 'system',
            text: '❌ Failed to connect to Jini AI. Make sure the server is running on ws://127.0.0.1:8000/ws',
          },
        ]);
      }
    };

    initializeWebSocket();

    // Cleanup: disconnect when app unmounts
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  // Handle backend message and display it
  const handleBackendMessage = (data: any) => {
    let aiReply = '';

    // Handle different response formats from backend
    if (typeof data === 'string') {
      aiReply = data;
    } else if (data.message) {
      aiReply = data.message;
    } else if (data.reply) {
      aiReply = data.reply;
    } else if (data.text) {
      aiReply = data.text;
    } else {
      aiReply = JSON.stringify(data);
    }

    setMessages((current) => [...current, { sender: 'ai', text: aiReply }]);
  };

  // Send message through WebSocket
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !connected || isLoading) {
      return;
    }

    // Add user message to chat
    setMessages((current) => [...current, { sender: 'user', text: trimmed }]);
    setInput('');
    setIsLoading(true);

    // Send to backend
    try {
      webSocketService.sendMessage({
        type: 'message',
        content: trimmed,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((current) => [
        ...current,
        { sender: 'system', text: '❌ Failed to send message. Please try again.' },
      ]);
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="app-card">
        <Header connected={connected} />
        <ChatWindow messages={messages} />
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          // Disable input if not connected or loading
          disabled={!connected || isLoading}
        />
      </div>
    </div>
  );
}

export default App;

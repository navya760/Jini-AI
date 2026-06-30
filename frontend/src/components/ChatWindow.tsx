import { useEffect, useRef } from 'react';
import Message from './Message';
import './ChatWindow.css';

type ChatMessage = {
  sender: 'user' | 'ai' | 'system';
  text: string;
};

type ChatWindowProps = {
  messages: ChatMessage[];
};

function ChatWindow({ messages }: ChatWindowProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-window" ref={listRef}>
      {messages.length === 0 ? (
        <div className="empty-state">Start chatting with Jini AI</div>
      ) : (
        messages.map((message, index) => (
          <Message key={index} text={message.text} sender={message.sender === 'user' ? 'user' : 'ai'} />
        ))
      )}
    </div>
  );
}

export default ChatWindow;

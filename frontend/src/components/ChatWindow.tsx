import { useEffect, useRef } from 'react';
import Message from './Message';
import './ChatWindow.css';
import { ChatMessage } from '../types/assistant';

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
    <section className="chat-window" ref={listRef} aria-live="polite">
      {messages.length === 0 ? (
        <div className="empty-state">Start chatting with Jini AI.</div>
      ) : (
        messages.map((message, index) => (
          <Message key={index} text={message.text} sender={message.sender} />
        ))
      )}
    </section>
  );
}

export default ChatWindow;

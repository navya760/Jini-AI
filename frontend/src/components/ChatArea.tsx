import React, { useEffect, useRef } from 'react';
// import MessageBubble from '../MessageBubble';
import MessageBubble from './MessageBubble';
import './ui.css';
import { ChatMessage } from '../types/assistant';
type ChatAreaProps = {
  messages: ChatMessage[];
};

export default function ChatArea({ messages }: ChatAreaProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-area" ref={listRef} aria-live="polite">
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="orb" aria-hidden />
          <div>
            <div className="welcome-title">Jini AI</div>
            <div className="welcome-sub">Your intelligent AI assistant</div>
          </div>
        </div>
      ) : (
        messages.map((m, idx) => (
          <MessageBubble key={idx} text={m.text} sender={m.sender} />
        ))
      )}
    </div>
  );
}

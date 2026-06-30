import React from 'react';
import './Message.css';

type MessageProps = {
  text: string;
  sender: 'user' | 'ai';
};

function Message({ text, sender }: MessageProps) {
  const isUser = sender === 'user';
  return (
    <div className={`message-row ${isUser ? 'message-user' : 'message-ai'}`}>
      <div className="message-bubble">
        <span>{text}</span>
      </div>
    </div>
  );
}

export default Message;

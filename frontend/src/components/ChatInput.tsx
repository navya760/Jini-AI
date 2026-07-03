import { ChangeEvent, KeyboardEvent } from 'react';
import './ChatInput.css';

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

function ChatInput({ value, onChange, onSend, disabled = false }: ChatInputProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && value.trim() && !disabled) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="chat-input-shell">
      <input
        type="text"
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? 'Waiting for Jini AI…' : 'Type a message…'}
        aria-label="Type a chat message"
        disabled={disabled}
      />
      <button onClick={onSend} disabled={!value.trim() || disabled}>
        Send
      </button>
    </div>
  );
}

export default ChatInput;

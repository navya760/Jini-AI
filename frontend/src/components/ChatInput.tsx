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
        placeholder={disabled ? 'Connecting...' : 'Type your message...'}
        aria-label="Type a message"
        disabled={disabled}
      />
      <button onClick={onSend} disabled={!value.trim() || disabled}>
        {disabled ? '⏳' : '📤'}
      </button>
    </div>
  );
}

export default ChatInput;

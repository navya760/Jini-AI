import React, { ChangeEvent, KeyboardEvent } from 'react';
import './ui.css';
import { HiMiniMicrophone } from "react-icons/hi2";
import { HiPaperAirplane } from "react-icons/hi2";

type Props = {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  onMicToggle: () => void;
  isRecording: boolean;
  disabled?: boolean;
  isLoading?: boolean;
};

export default function InputBox({ value, onChange, onSend, onMicToggle, isRecording, disabled = false, isLoading = false }: Props) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim() && !disabled) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="floating-input">
      <button
        className={`mic-btn ${isRecording ? 'recording' : ''}`}
        onClick={onMicToggle}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        disabled={disabled}
      >
        <HiMiniMicrophone size={22} />
      </button>

      <input
        className="floating-text"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? 'Waiting for Jini AI…' : 'Type a message…'}
        disabled={disabled}
        aria-label="Type a message"
      />

      <button
        className="send-btn"
        onClick={onSend}
        disabled={!value.trim() || disabled || isLoading}
        aria-label="Send message"
      >
        <HiPaperAirplane size={20} />
      </button>
    </div>
  );
}

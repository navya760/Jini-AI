import React from 'react';
import './ui.css';
import { FiMessageSquare } from 'react-icons/fi';

type Props = {
  onOpenChat: () => void;
  onMicToggle: () => void;
  isRecording: boolean;
  latestReply: string;
};

export default function SimpleUI({ onOpenChat, onMicToggle, isRecording, latestReply }: Props) {
  return (
    <div className="simple-ui">
      <div className="simple-card">
        <div className="simple-orb" aria-hidden />
        <div className="simple-content">
          <div className="simple-title">Jini AI</div>
          <div className="simple-sub">Tap to speak or open chat</div>

          <div className="simple-preview">{latestReply ? latestReply : 'No messages yet — say hi!'}</div>

          <div className="simple-actions">
            <button
              className={`mic-btn ${isRecording ? 'recording' : ''}`}
              onClick={onMicToggle}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              🎙️
            </button>

            <button className="icon-circle" onClick={onOpenChat} title="Open full chat">
              <FiMessageSquare size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

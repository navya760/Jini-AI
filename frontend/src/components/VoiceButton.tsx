import './VoiceButton.css';

type VoiceButtonProps = {
  active: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
};

function VoiceButton({ active, onStart, onStop, disabled = false }: VoiceButtonProps) {
  return (
    <button
      className={`voice-button ${active ? 'active' : ''}`}
      onClick={active ? onStop : onStart}
      disabled={disabled}
      aria-label={active ? 'Stop voice recording' : 'Start voice recording'}
    >
      <span className="voice-icon">🎙️</span>
      {/* <span>{active ? 'Stop' : 'Speak'}</span> */}
    </button>
  );
}

export default VoiceButton;

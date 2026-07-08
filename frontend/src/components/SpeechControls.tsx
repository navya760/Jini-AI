import './SpeechControls.css';

type SpeechControlsProps = {
  supported: boolean;
  state: 'idle' | 'playing' | 'unsupported' | 'error';
  muted: boolean;
  latestReply: string;
  onToggleMute: () => void;
  onStop: () => void;
  onPlayAgain: () => void;
};

function SpeechControls({ supported, state, muted, latestReply, onToggleMute, onStop, onPlayAgain }: SpeechControlsProps) {
  const isActive = state === 'playing';
  const showPlayAgain = !!latestReply.trim();

  return (
    <div className="speech-controls" aria-live="polite">
      <div className="speech-status">
        {/* <span className={`speech-indicator ${isActive ? 'active' : ''}`} aria-hidden="true" /> */}
        {/* <span>
          {supported
            ? isActive
              ? 'Jini is speaking…'
              : muted
              ? 'AI voice is muted'
              : 'Jini voice ready'
            : 'Voice playback unavailable'}
        </span> */}
      </div>

      {/* <div className="speech-actions">
        <button type="button" className="speech-button" onClick={onToggleMute}>
          {muted ? 'Unmute' : 'Mute'}
        </button>
        <button type="button" className="speech-button" onClick={onStop} disabled={!isActive}>
          Stop
        </button>
        {showPlayAgain && (
          <button type="button" className="speech-button" onClick={onPlayAgain}>
            Play Again
          </button>
        )}
      </div> */}
    </div>
  );
}

export default SpeechControls;

import React from 'react';
import './Header.css';

type HeaderProps = {
  connected: boolean;
};

function Header({ connected }: HeaderProps) {
  return (
    <header className="header-shell">
      <div className="header-title">🤖 Jini AI</div>
      <div className={`status-pill ${connected ? 'online' : 'offline'}`}>
        {connected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
    </header>
  );
}

export default Header;

import React from 'react';
import './ui.css';
import { FiSettings, FiUser, FiMessageSquare } from 'react-icons/fi';

type NavbarProps = {
  connected: boolean;
  activeTab: string;
  onChangeTab: (tab: string) => void;
};

export default function Navbar({ connected, activeTab, onChangeTab }: NavbarProps) {
  return (
    <nav className="jini-navbar">
      <div className="jini-navbar-left">
        <div className="jini-logo">
          <div className="logo-mark">JI</div>
          <div>
            <div className="header-title">Jini AI</div>
            <div className="logo-text">Your intelligent assistant</div>
          </div>
        </div>
      </div>

      <div className="jini-navbar-center">
        <button
          className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => onChangeTab('chat')}
        >
          Chat
        </button>
        <button
          className={`nav-tab ${activeTab === 'voice' ? 'active' : ''}`}
          onClick={() => onChangeTab('voice')}
        >
          Voice
        </button>
        <button
          className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => onChangeTab('history')}
        >
          History
        </button>
      </div>

      <div className="jini-navbar-right">
        <div className={`status-pill ${connected ? 'online' : 'offline'}`}>{connected ? 'Online' : 'Offline'}</div>
        <div className="icon-circle" title="Simple UI" onClick={() => onChangeTab('simple')}>
          <FiMessageSquare size={18} />
        </div>
        <div className="icon-circle" title="Profile">
          <FiUser size={18} />
        </div>
        <div className="icon-circle" title="Settings">
          <FiSettings size={18} />
        </div>
      </div>
    </nav>
  );
}

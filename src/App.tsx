import { useState } from 'react';
import Game from './pages/Game';
import Settings from './pages/Settings';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'game' | 'settings'>('game');

  return (
    <div className="app">
      <nav className="app-navbar">
        <div className="navbar-content">
          <h1 className="navbar-title">🎬 Kim Milyoner Olmak İster?</h1>
          <div className="navbar-buttons">
            <button
              className={`nav-button ${currentPage === 'game' ? 'active' : ''}`}
              onClick={() => setCurrentPage('game')}
            >
              🎮 Oyun
            </button>
            <button
              className={`nav-button ${currentPage === 'settings' ? 'active' : ''}`}
              onClick={() => setCurrentPage('settings')}
            >
              ⚙️ Ayarlar
            </button>
          </div>
        </div>
      </nav>

      <main className="app-main">
        {currentPage === 'game' && <Game />}
        {currentPage === 'settings' && <Settings />}
      </main>
    </div>
  );
}

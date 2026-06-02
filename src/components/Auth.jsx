import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import './Auth.css';

const Auth = () => {
  const { user, setUsername } = useGame();
  const [inputName, setInputName] = useState('');

  // Si ya tenemos usuario (nombre), no mostramos el login
  if (user) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputName.trim()) {
      setUsername(inputName.trim());
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-emoji">🏡</span>
          <h1>Cozy Garden</h1>
          <p>Un espacio especial para ti y tu pareja</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder="Tu nombre..."
            className="auth-input"
            maxLength={20}
            autoFocus
          />
          <button type="submit" className="auth-btn" disabled={!inputName.trim()}>
            🌱 Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;

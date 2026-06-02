import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import './Auth.css';

const Auth = () => {
  const { user } = useGame();

  // Si ya tenemos usuario (ID local), no mostramos el login
  if (user) {
    return null;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-emoji">🏡</span>
          <h1>Cozy Garden</h1>
          <p>Un espacio especial para ti y tu pareja</p>
        </div>
        
        <p className="auth-footer">
          Cargando...
        </p>
      </div>
    </div>
  );
};

export default Auth;

import React from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import Auth from './components/Auth';
import GardenWorld from './components/GardenWorld';
import './App.css';

function AppContent() {
  const { user, loading } = useGame();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return user ? <GardenWorld /> : <Auth />;
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;

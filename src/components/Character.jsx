import React from 'react';
import './Character.css';

const Character = ({ player, isLocal = false }) => {
  const { id, emoji, x, y, message, messageTime, accessory } = player;

  const showMessage = message && messageTime && (Date.now() - messageTime < 5000);

  const accessories = {
    hat: '🎩',
    crown: '👑',
    glasses: '🕶️',
    bow: '🎀',
    flower: '💐',
    star: '⭐',
    heart: '❤️',
    wings: '👼',
    halo: '😇',
    mask: '🎭',
    tiara: '👸',
    balloon: '🎈',
    umbrella: '☂️',
    magic: '🪄'
  };

  return (
    <div 
      className={`character ${isLocal ? 'local' : 'remote'}`}
      style={{ 
        left: `${x}%`, 
        top: `${y}%` 
      }}
    >
      {showMessage && (
        <div className="chat-bubble">
          <div className="chat-bubble-tail"></div>
          <span className="chat-message">{message}</span>
        </div>
      )}
      {accessory && (
        <div className="character-accessory">
          {accessories[accessory]}
        </div>
      )}
      <div className="character-emoji">{emoji}</div>
      <div className={`name-tag ${isLocal ? 'local' : 'remote'}`}>
        {id}
      </div>
    </div>
  );
};

export default Character;

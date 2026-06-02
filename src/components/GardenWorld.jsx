import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import Character from './Character';
import './GardenWorld.css';

const GardenWorld = () => {
  const { user, roomId, players, myPlayer, updatePosition, sendMessage, changeEmoji, createRoom, joinRoom } = useGame();
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomInput, setRoomInput] = useState('');
  const worldRef = useRef(null);

  const emojis = ['😊', '🥰', '😎', '🤗', '😇', '🥳', '😸', '🦊', '🐰', '🐻', '🐼', '🦄'];

  const handleWorldClick = (e) => {
    if (!worldRef.current) return;
    
    const rect = worldRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    updatePosition(Math.max(5, Math.min(95, x)), Math.max(5, Math.min(95, y)));
  };

  const handleSendChat = () => {
    if (chatInput.trim()) {
      sendMessage(chatInput);
      setChatInput('');
      setShowChat(false);
    }
  };

  const handleCreateRoom = async () => {
    const newRoomId = await createRoom();
    setShowRoomModal(false);
  };

  const handleJoinRoom = async () => {
    if (roomInput.trim()) {
      await joinRoom(roomInput.trim());
      setShowRoomModal(false);
    }
  };

  const otherPlayers = Object.entries(players).filter(([id]) => id !== user?.uid);

  return (
    <div className="garden-world">
      {!roomId && (
        <div className="room-modal">
          <div className="room-modal-content">
            <h2>🏡 Cozy Garden</h2>
            <p>Crea una sala o únete a una existente para jugar con tu pareja</p>
            <button className="room-btn" onClick={handleCreateRoom}>
              🌱 Crear Sala
            </button>
            <div className="room-divider">o</div>
            <input
              type="text"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              placeholder="ID de la sala"
              className="room-input"
            />
            <button 
              className="room-btn" 
              onClick={handleJoinRoom}
              disabled={!roomInput.trim()}
            >
              🤝 Unirse
            </button>
          </div>
        </div>
      )}

      {roomId && (
        <div className="room-info">
          Sala: {roomId.slice(-6)}
        </div>
      )}

      <div 
        ref={worldRef}
        className="world-container"
        onClick={handleWorldClick}
      >
        <div className="garden-background">
          <div className="grass-pattern"></div>
          <div className="decorations">
            <span className="decoration flower1">🌸</span>
            <span className="decoration flower2">🌻</span>
            <span className="decoration flower3">🌷</span>
            <span className="decoration tree1">🌳</span>
            <span className="decoration tree2">🌲</span>
            <span className="decoration bush1">🌿</span>
            <span className="decoration bush2">🍀</span>
          </div>
        </div>

        {user && myPlayer.id && (
          <Character player={myPlayer} isLocal={true} />
        )}

        {otherPlayers.map(([id, player]) => (
          <Character key={id} player={player} isLocal={false} />
        ))}
      </div>

      <div className="controls">
        <button 
          className="control-btn chat-btn"
          onClick={() => setShowChat(!showChat)}
        >
          💬
        </button>
        <button 
          className="control-btn emoji-btn"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          {myPlayer.emoji}
        </button>
      </div>

      {showChat && (
        <div className="chat-panel">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="chat-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
            autoFocus
          />
          <button className="send-btn" onClick={handleSendChat}>
            ➤
          </button>
        </div>
      )}

      {showEmojiPicker && (
        <div className="emoji-picker">
          {emojis.map(emoji => (
            <button
              key={emoji}
              className="emoji-option"
              onClick={() => {
                changeEmoji(emoji);
                setShowEmojiPicker(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GardenWorld;

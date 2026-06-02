import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { ref, remove } from 'firebase/database';
import { database } from '../firebase/config';
import Character from './Character';
import './GardenWorld.css';

const GardenWorld = () => {
  const { user, roomId, players, flowers, drawings, background, currentLocation, myPlayer, updatePosition, sendMessage, changeEmoji, createRoom, joinRoom, plantFlower, waterFlower, changeBackground, changeAccessory, changeLocation, addDrawing, deleteDrawing } = useGame();
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomInput, setRoomInput] = useState('');
  const [showFlowerMenu, setShowFlowerMenu] = useState(false);
  const [showBackgroundMenu, setShowBackgroundMenu] = useState(false);
  const [showAccessoryMenu, setShowAccessoryMenu] = useState(false);
  const [plantingPosition, setPlantingPosition] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [selectedFlower, setSelectedFlower] = useState(null);
  const [pressedButton, setPressedButton] = useState(null);
  const [wateringFlower, setWateringFlower] = useState(null);
  const worldRef = useRef(null);
  const canvasRef = useRef(null);

  const locations = [
    { id: 'garden', name: '🏡 Jardín', background: 'meadow' },
    { id: 'beach', name: '🏖️ Playa', background: 'beach' },
    { id: 'forest', name: '🌲 Bosque', background: 'forest' },
    { id: 'house', name: '🏠 Casa', background: 'sunset' }
  ];

  const emojis = [
    '😊', '🥰', '😎', '🤗', '😇', '🥳', '😸', '🦊', '🐰', '🐻', '🐼', '🦄',
    '🐶', '🐱', '🐭', '🐹', '🐲', '🐢', '🦉', '🦋', '🌸', '🌺', '🌻', '🌹',
    '🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🌈', '⭐', '🌙', '☀️', '🎈', '🎀',
    '🎭', '🎪', '🎨', '🎬', '🎮', '🎯', '🎲', '🎸', '🎹', '🎺', '🎻', '🥁'
  ];

  const flowerTypes = [
    { type: 'rose', name: '🌹 Rosa', emojis: ['🌱', '🌿', '🥀', '🌹'] },
    { type: 'sunflower', name: '🌻 Girasol', emojis: ['🌱', '🌿', '🌼', '🌻'] },
    { type: 'tulip', name: '🌷 Tulipán', emojis: ['🌱', '🌿', '🌷', '🌷'] },
    { type: 'cherry', name: '🌸 Cerezo', emojis: ['🌱', '🌿', '🌸', '🌸'] },
    { type: 'lily', name: '🌺 Lirio', emojis: ['🌱', '🌿', '🌺', '🌺'] },
    { type: 'daisy', name: '🌼 Margarita', emojis: ['🌱', '🌿', '🌼', '🌼'] }
  ];

  const backgrounds = [
    { 
      id: 'meadow', 
      name: '🌿 Prado', 
      gradient: 'linear-gradient(180deg, #87CEEB 0%, #98FB98 30%, #32CD32 60%, #228B22 100%)',
      pattern: 'meadow'
    },
    { 
      id: 'beach', 
      name: '🏖️ Playa', 
      gradient: 'linear-gradient(180deg, #87CEEB 0%, #FFD700 40%, #F4A460 70%, #DEB887 100%)',
      pattern: 'beach'
    },
    { 
      id: 'forest', 
      name: '🌲 Bosque', 
      gradient: 'linear-gradient(180deg, #2E8B57 0%, #228B22 40%, #006400 70%, #004d00 100%)',
      pattern: 'forest'
    },
    { 
      id: 'mountain', 
      name: '⛰️ Montaña', 
      gradient: 'linear-gradient(180deg, #87CEEB 0%, #B0C4DE 30%, #A9A9A9 50%, #696969 80%, #2F4F4F 100%)',
      pattern: 'mountain'
    },
    { 
      id: 'sunset', 
      name: '🌅 Atardecer', 
      gradient: 'linear-gradient(180deg, #FF6B6B 0%, #FFD93D 30%, #FF8C00 50%, #FF4500 80%, #8B0000 100%)',
      pattern: 'sunset'
    },
    { 
      id: 'night', 
      name: '🌙 Noche', 
      gradient: 'linear-gradient(180deg, #191970 0%, #4B0082 30%, #2F004F 60%, #000000 100%)',
      pattern: 'night'
    },
    { 
      id: 'snow', 
      name: '❄️ Nieve', 
      gradient: 'linear-gradient(180deg, #E0FFFF 0%, #B0E0E6 30%, #87CEEB 60%, #4682B4 100%)',
      pattern: 'snow'
    },
    { 
      id: 'desert', 
      name: '🏜️ Desierto', 
      gradient: 'linear-gradient(180deg, #FFD700 0%, #FFA500 30%, #FF8C00 60%, #8B4513 100%)',
      pattern: 'desert'
    }
  ];

  const accessories = [
    { id: null, name: 'Sin accesorio', emoji: '' },
    { id: 'hat', name: '🎩 Sombrero', emoji: '🎩' },
    { id: 'crown', name: '👑 Corona', emoji: '👑' },
    { id: 'glasses', name: '🕶️ Gafas', emoji: '🕶️' },
    { id: 'bow', name: '🎀 Lazo', emoji: '🎀' },
    { id: 'flower', name: '💐 Flores', emoji: '💐' },
    { id: 'star', name: '⭐ Estrella', emoji: '⭐' },
    { id: 'heart', name: '❤️ Corazón', emoji: '❤️' },
    { id: 'wings', name: '👼 Alas', emoji: '👼' },
    { id: 'halo', name: '😇 Halo', emoji: '😇' },
    { id: 'mask', name: '🎭 Máscara', emoji: '🎭' },
    { id: 'tiara', name: '👸 Tiara', emoji: '👸' },
    { id: 'balloon', name: '🎈 Globo', emoji: '🎈' },
    { id: 'umbrella', name: '☂️ Paraguas', emoji: '☂️' },
    { id: 'magic', name: '🪄 Varita', emoji: '🪄' }
  ];

  const getFlowerEmoji = (type, stage) => {
    const flower = flowerTypes.find(f => f.type === type);
    return flower ? flower.emojis[stage] : '🌱';
  };

  const handleWorldClick = (e) => {
    if (!worldRef.current) return;

    const rect = worldRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (isErasing) {
      // Borrar dibujo si está cerca del clic
      const filteredDrawings = drawings.filter(d => d.location === currentLocation);
      const clickedDrawing = filteredDrawings.find(drawing => {
        if (!drawing.points) return false;
        return drawing.points.some(point => {
          const pointX = (point.x / window.innerWidth) * 100;
          const pointY = (point.y / window.innerHeight) * 100;
          const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
          return distance < 5;
        });
      });

      if (clickedDrawing) {
        deleteDrawing(clickedDrawing.id);
      }

      // Si no se borró nada, salir sin hacer nada más
      return;
    } else {
      // Mover el personaje
      updatePosition(Math.max(5, Math.min(95, x)), Math.max(5, Math.min(95, y)));
    }
  };

  const handleWorldTouch = (e) => {
    const touch = e.changedTouches[0];
    const rect = worldRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    if (isErasing) {
      const filteredDrawings = drawings.filter(d => d.location === currentLocation);
      const clickedDrawing = filteredDrawings.find(drawing => {
        if (!drawing.points) return false;
        return drawing.points.some(point => {
          const pointX = (point.x / window.innerWidth) * 100;
          const pointY = (point.y / window.innerHeight) * 100;
          const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
          return distance < 5;
        });
      });

      if (clickedDrawing) {
        deleteDrawing(clickedDrawing.id);
      }
      return;
    } else {
      const clickedFlower = flowers.find(flower => {
        const flowerX = flower.x;
        const flowerY = flower.y;
        const distance = Math.sqrt(Math.pow(x - flowerX, 2) + Math.pow(y - flowerY, 2));
        return distance < 15;
      });

      if (clickedFlower) {
        setSelectedFlower(clickedFlower);
        closeAllMenus();
      } else {
        updatePosition(Math.max(5, Math.min(95, x)), Math.max(5, Math.min(95, y)));
      }
    }
  };

  const handlePointerDown = (e) => {
    const rect = worldRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (isErasing) {
      const filteredDrawings = drawings.filter(d => d.location === currentLocation);
      const clickedDrawing = filteredDrawings.find(drawing => {
        if (!drawing.points) return false;
        return drawing.points.some(point => {
          const pointX = (point.x / window.innerWidth) * 100;
          const pointY = (point.y / window.innerHeight) * 100;
          const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
          return distance < 5;
        });
      });

      if (clickedDrawing) {
        deleteDrawing(clickedDrawing.id);
      }
      return;
    } else {
      const clickedFlower = flowers.find(flower => {
        const flowerX = flower.x;
        const flowerY = flower.y;
        const distance = Math.sqrt(Math.pow(x - flowerX, 2) + Math.pow(y - flowerY, 2));
        return distance < 15;
      });

      if (clickedFlower) {
        setSelectedFlower(clickedFlower);
        closeAllMenus();
      } else {
        updatePosition(Math.max(5, Math.min(95, x)), Math.max(5, Math.min(95, y)));
      }
    }
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    if (!worldRef.current) return;
    
    const rect = worldRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPlantingPosition({ x, y });
    setShowFlowerMenu(true);
  };

  const handlePlantFlower = (type) => {
    if (plantingPosition) {
      plantFlower(plantingPosition.x, plantingPosition.y, type);
      setShowFlowerMenu(false);
      setPlantingPosition(null);
    }
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

  const closeAllMenus = () => {
    setShowChat(false);
    setShowEmojiPicker(false);
    setShowFlowerMenu(false);
    setShowBackgroundMenu(false);
    setShowAccessoryMenu(false);
    setSelectedFlower(null);
  };

  const openMenu = (menuSetter) => {
    closeAllMenus();
    menuSetter(true);
  };

  // Configurar canvas para dibujo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let drawing = false;
    let lastX = 0;
    let lastY = 0;
    let currentPoints = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redrawCanvas();
    };

    const redrawCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const filteredDrawings = drawings.filter(d => d.location === currentLocation);
      filteredDrawings.forEach(drawing => {
        if (drawing.points && drawing.points.length > 1) {
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
          for (let i = 1; i < drawing.points.length; i++) {
            ctx.lineTo(drawing.points[i].x, drawing.points[i].y);
          }
          ctx.stroke();
        }
      });
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const startDrawing = (e) => {
      if (!isDrawing) return;
      drawing = true;
      [lastX, lastY] = [e.clientX, e.clientY];
      currentPoints = [{ x: e.clientX, y: e.clientY }];
    };

    const draw = (e) => {
      if (!drawing || !isDrawing) return;
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(e.clientX, e.clientY);
      ctx.stroke();
      [lastX, lastY] = [e.clientX, e.clientY];
      currentPoints.push({ x: e.clientX, y: e.clientY });
    };

    const stopDrawing = async () => {
      if (drawing && currentPoints.length > 1) {
        await addDrawing(currentPoints);
      }
      drawing = false;
      currentPoints = [];
    };

    // Capturar eventos del canvas solo cuando está en modo dibujo
    const touchStartHandler = (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const touch = e.touches[0];
      startDrawing({ clientX: touch.clientX, clientY: touch.clientY });
    };
    const touchMoveHandler = (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const touch = e.touches[0];
      draw({ clientX: touch.clientX, clientY: touch.clientY });
    };

    if (isDrawing) {
      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('touchstart', touchStartHandler, { passive: false });
      canvas.addEventListener('touchmove', touchMoveHandler, { passive: false });
      canvas.addEventListener('touchend', stopDrawing);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('touchstart', touchStartHandler);
      canvas.removeEventListener('touchmove', touchMoveHandler);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [isDrawing, drawings, currentLocation, addDrawing]);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!worldRef.current) return;

      // Verificar si el clic fue en un menú
      const clickedMenu = e.target.closest('.flower-action-menu') ||
                          e.target.closest('.emoji-picker') ||
                          e.target.closest('.flower-menu') ||
                          e.target.closest('.background-menu') ||
                          e.target.closest('.accessory-menu') ||
                          e.target.closest('.garden-flower');

      if (!clickedMenu) {
        closeAllMenus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const otherPlayers = Object.entries(players).filter(([id, player]) =>
    id !== user && player.location === currentLocation
  );

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
        onContextMenu={handleRightClick}
      >
        <div 
          className="garden-background"
          data-pattern={backgrounds.find(bg => bg.id === background)?.pattern || 'meadow'}
          style={{ 
            background: backgrounds.find(bg => bg.id === background)?.gradient || backgrounds[0].gradient
          }}
        >
          <canvas
            ref={canvasRef}
            className="drawing-canvas"
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: isDrawing ? 'auto' : 'none',
              zIndex: 5
            }}
          />
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

        {flowers.map(flower => (
          <div
            key={flower.id}
            className={`garden-flower ${wateringFlower === flower.id ? 'watering' : ''}`}
            style={{
              left: `${flower.x}%`,
              top: `${flower.y}%`
            }}
            onClick={(e) => {
              e.stopPropagation();
              closeAllMenus();
              setSelectedFlower(flower);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              closeAllMenus();
              setSelectedFlower(flower);
            }}
          >
            <span className="flower-emoji">{getFlowerEmoji(flower.type, flower.stage)}</span>
            <div className="flower-water-bar">
              <div 
                className="flower-water-fill" 
                style={{ width: `${flower.water}%` }}
              />
            </div>
          </div>
        ))}

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
          onClick={() => openMenu(setShowChat)}
        >
          💬
        </button>
        <button 
          className="control-btn plant-btn"
          onClick={() => {
            setPlantingPosition({ x: myPlayer.x, y: myPlayer.y + 5 });
            openMenu(setShowFlowerMenu);
          }}
        >
          🌱
        </button>
        <button 
          className={`control-btn draw-btn ${isDrawing ? 'active' : ''}`}
          onClick={() => {
            setIsDrawing(!isDrawing);
            setIsErasing(false);
          }}
        >
          ✏️
        </button>
        <button
          className={`control-btn clear-btn ${isErasing ? 'active' : ''}`}
          onClick={() => {
            setIsErasing(!isErasing);
            setIsDrawing(false);
          }}
        >
          ❌
        </button>
        <button 
          className="control-btn accessory-btn"
          onClick={() => openMenu(setShowAccessoryMenu)}
        >
          {accessories.find(a => a.id === myPlayer.accessory)?.emoji || '👗'}
        </button>
        <button 
          className="control-btn emoji-btn"
          onClick={() => openMenu(setShowEmojiPicker)}
        >
          {myPlayer.emoji}
        </button>
      </div>

      <div className="locations">
        {locations.map(loc => (
          <button 
            key={loc.id}
            className={`control-btn location-btn ${currentLocation === loc.id ? 'active' : ''}`}
            onClick={() => {
              changeLocation(loc.id);
              changeBackground(loc.background);
            }}
            title={loc.name}
          >
            {loc.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {showChat && (
        <div className="chat-panel">
          <div className="chat-panel-header">
            <h3>💬 Chat</h3>
            <button className="close-btn" onClick={() => setShowChat(false)}>✕</button>
          </div>
          <div className="chat-panel-body">
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
        </div>
      )}

      {showEmojiPicker && (
        <div className="emoji-picker">
          <div className="emoji-picker-header">
            <h3>😀 Tu Emoji</h3>
            <button className="close-btn" onClick={() => setShowEmojiPicker(false)}>✕</button>
          </div>
          <div className="emoji-options">
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
        </div>
      )}

      {showFlowerMenu && (
        <div className="flower-menu">
          <div className="flower-menu-header">
            <h3>🌱 Plantar Flor</h3>
            <button className="close-btn" onClick={() => setShowFlowerMenu(false)}>✕</button>
          </div>
          <div className="flower-options">
            {flowerTypes.map(flower => (
              <button
                key={flower.type}
                className="flower-option"
                onClick={() => handlePlantFlower(flower.type)}
              >
                <span className="flower-option-emoji">{flower.emojis[3]}</span>
                <span className="flower-option-name">{flower.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showBackgroundMenu && (
        <div className="background-menu">
          <div className="background-menu-header">
            <h3>🎨 Cambiar Fondo</h3>
            <button className="close-btn" onClick={() => setShowBackgroundMenu(false)}>✕</button>
          </div>
          <div className="background-options">
            {backgrounds.map(bg => (
              <button
                key={bg.id}
                className={`background-option ${background === bg.id ? 'active' : ''}`}
                onClick={() => {
                  changeBackground(bg.id);
                  setShowBackgroundMenu(false);
                }}
              >
                <div 
                  className="background-preview"
                  style={{ background: bg.gradient }}
                />
                <span className="background-name">{bg.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showAccessoryMenu && (
        <div className="accessory-menu">
          <div className="accessory-menu-header">
            <h3>👗 Accesorios</h3>
            <button className="close-btn" onClick={() => setShowAccessoryMenu(false)}>✕</button>
          </div>
          <div className="accessory-options">
            {accessories.map(acc => (
              <button
                key={acc.id || 'none'}
                className={`accessory-option ${myPlayer.accessory === acc.id ? 'active' : ''}`}
                onClick={() => {
                  changeAccessory(acc.id);
                  setShowAccessoryMenu(false);
                }}
              >
                <span className="accessory-option-emoji">{acc.emoji || '❌'}</span>
                <span className="accessory-option-name">{acc.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedFlower && (
        <div
          className="flower-action-menu"
          style={{
            left: `${selectedFlower.x}%`,
            top: `${selectedFlower.y}%`,
            transform: 'translate(-50%, -122%)'
          }}
        >
          <div className="flower-action-menu-header">
            <h3>{flowerTypes.find(f => f.type === selectedFlower.type)?.name || 'Flor'}</h3>
            <button className="close-btn" onClick={() => setSelectedFlower(null)}>✕</button>
          </div>
          <div className="flower-action-options">
            <button
              className={`flower-action-option ${pressedButton === 'water' ? 'pressed' : ''}`}
              onClick={() => {
                setWateringFlower(selectedFlower.id);
                waterFlower(selectedFlower.id);
                setTimeout(() => setWateringFlower(null), 500);
              }}
              onMouseDown={() => setPressedButton('water')}
              onMouseUp={() => setPressedButton(null)}
              onMouseLeave={() => setPressedButton(null)}
              onTouchStart={() => setPressedButton('water')}
              onTouchEnd={() => setPressedButton(null)}
            >
              <span className="flower-action-option-emoji">💧</span>
              <span className="flower-action-option-name">Regar</span>
            </button>
            <button
              className={`flower-action-option ${pressedButton === 'remove' ? 'pressed' : ''}`}
              onClick={() => {
                remove(ref(database, `rooms/${roomId}/flowers/${selectedFlower.id}`));
                setSelectedFlower(null);
              }}
              onMouseDown={() => setPressedButton('remove')}
              onMouseUp={() => setPressedButton(null)}
              onMouseLeave={() => setPressedButton(null)}
              onTouchStart={() => setPressedButton('remove')}
              onTouchEnd={() => setPressedButton(null)}
            >
              <span className="flower-action-option-emoji">❌</span>
              <span className="flower-action-option-name">Quitar</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default GardenWorld;

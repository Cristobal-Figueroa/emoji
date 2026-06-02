import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebase/config';
import { ref, set, onValue, update, push } from 'firebase/database';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState({});
  const [myPlayer, setMyPlayer] = useState({
    id: null,
    emoji: '😊',
    x: 50,
    y: 50,
    message: '',
    messageTime: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generar ID local sin autenticación
    const localId = localStorage.getItem('cozyUserId') || Math.random().toString(36).substr(2, 9);
    localStorage.setItem('cozyUserId', localId);
    
    setUserId(localId);
    setMyPlayer(prev => ({ ...prev, id: localId }));
    setLoading(false);
  }, []);

  const createRoom = async () => {
    if (!userId) return;
    
    const newRoomId = Date.now().toString();
    const roomRef = ref(database, `rooms/${newRoomId}`);
    
    await set(roomRef, {
      createdAt: Date.now(),
      createdBy: userId
    });

    setRoomId(newRoomId);
    joinRoom(newRoomId);
    return newRoomId;
  };

  const joinRoom = async (roomIdToJoin) => {
    if (!userId) return;

    setRoomId(roomIdToJoin);
    
    const playersRef = ref(database, `rooms/${roomIdToJoin}/players`);
    
    const unsubscribe = onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPlayers(data);
      } else {
        setPlayers({});
      }
    });

    // Agregar jugador actual a la sala
    await update(ref(database, `rooms/${roomIdToJoin}/players/${userId}`), {
      emoji: myPlayer.emoji,
      x: myPlayer.x,
      y: myPlayer.y,
      message: '',
      messageTime: null,
      lastSeen: Date.now()
    });

    return () => unsubscribe();
  };

  const updatePosition = async (x, y) => {
    if (!userId || !roomId) return;

    setMyPlayer(prev => ({ ...prev, x, y }));

    await update(ref(database, `rooms/${roomId}/players/${userId}`), {
      x,
      y,
      lastSeen: Date.now()
    });
  };

  const sendMessage = async (message) => {
    if (!userId || !roomId) return;

    const now = Date.now();
    setMyPlayer(prev => ({ ...prev, message, messageTime: now }));

    await update(ref(database, `rooms/${roomId}/players/${userId}`), {
      message,
      messageTime: now
    });

    // Limpiar mensaje después de 5 segundos
    setTimeout(async () => {
      await update(ref(database, `rooms/${roomId}/players/${userId}`), {
        message: '',
        messageTime: null
      });
      setMyPlayer(prev => ({ ...prev, message: '', messageTime: null }));
    }, 5000);
  };

  const changeEmoji = async (emoji) => {
    if (!userId || !roomId) return;

    setMyPlayer(prev => ({ ...prev, emoji }));

    await update(ref(database, `rooms/${roomId}/players/${userId}`), {
      emoji
    });
  };

  const value = {
    user: userId,
    roomId,
    players,
    myPlayer,
    loading,
    createRoom,
    joinRoom,
    updatePosition,
    sendMessage,
    changeEmoji
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

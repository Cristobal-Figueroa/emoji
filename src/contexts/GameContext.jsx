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
  const [flowers, setFlowers] = useState([]);
  const [background, setBackground] = useState('meadow');
  const [myPlayer, setMyPlayer] = useState({
    id: null,
    emoji: '😊',
    x: 50,
    y: 50,
    message: '',
    messageTime: null,
    accessory: null
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
    
    const unsubscribePlayers = onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPlayers(data);
      } else {
        setPlayers({});
      }
    });

    const flowersRef = ref(database, `rooms/${roomIdToJoin}/flowers`);
    const unsubscribeFlowers = onValue(flowersRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Flores cargadas de Firebase:', data);
      if (data) {
        const flowersArray = Object.entries(data).map(([id, flower]) => ({ id, ...flower }));
        console.log('Array de flores:', flowersArray);
        setFlowers(flowersArray);
      } else {
        console.log('No hay flores en la sala');
        setFlowers([]);
      }
    });

    const roomRef = ref(database, `rooms/${roomIdToJoin}`);
    const unsubscribeRoom = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.background) {
        setBackground(data.background);
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

    return () => {
      unsubscribePlayers();
      unsubscribeFlowers();
      unsubscribeRoom();
    };
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

  const plantFlower = async (x, y, type) => {
    if (!userId || !roomId) return;

    const newFlower = {
      type,
      x,
      y,
      stage: 0, // 0: semilla, 1: brote, 2: flor pequeña, 3: flor madura
      water: 50,
      plantedAt: Date.now(),
      lastWatered: null,
      plantedBy: userId
    };

    const flowerId = Date.now().toString();
    console.log('Plantando flor:', flowerId, newFlower);
    await update(ref(database, `rooms/${roomId}/flowers/${flowerId}`), newFlower);
  };

  const waterFlower = async (flowerId) => {
    if (!userId || !roomId) return;

    const flower = flowers.find(f => f.id === flowerId);
    if (!flower) return;

    const newWater = Math.min(100, flower.water + 25);
    let newStage = flower.stage;

    // La flor crece si tiene suficiente agua
    if (newWater >= 80 && flower.stage < 3) {
      newStage = flower.stage + 1;
    }

    await update(ref(database, `rooms/${roomId}/flowers/${flowerId}`), {
      water: newWater,
      stage: newStage,
      lastWatered: Date.now()
    });
  };

  const changeBackground = async (bg) => {
    if (!userId || !roomId) return;

    setBackground(bg);
    await update(ref(database, `rooms/${roomId}`), {
      background: bg
    });
  };

  const changeAccessory = async (accessory) => {
    if (!userId || !roomId) return;

    setMyPlayer(prev => ({ ...prev, accessory }));

    await update(ref(database, `rooms/${roomId}/players/${userId}`), {
      accessory
    });
  };

  const value = {
    user: userId,
    roomId,
    players,
    flowers,
    background,
    myPlayer,
    loading,
    createRoom,
    joinRoom,
    updatePosition,
    sendMessage,
    changeEmoji,
    plantFlower,
    waterFlower,
    changeBackground,
    changeAccessory
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

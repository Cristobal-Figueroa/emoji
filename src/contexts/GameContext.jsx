import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebase/config';
import { ref, set, onValue, update, push, remove } from 'firebase/database';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [userName, setUserName] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState({});
  const [flowers, setFlowers] = useState([]);
  const [background, setBackground] = useState('meadow');
  const [currentLocation, setCurrentLocation] = useState('garden');
  const [myPlayer, setMyPlayer] = useState({
    id: null,
    emoji: '😊',
    x: 50,
    y: 50,
    message: '',
    messageTime: null,
    accessory: null
  });
  const [allFlowers, setAllFlowers] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleSetUsername = (name) => {
    setUserName(name);
    setMyPlayer(prev => ({ ...prev, id: name }));
    localStorage.setItem('cozyUserName', name);
  };

  // Filtrar flores por lugar actual
  useEffect(() => {
    const filteredFlowers = allFlowers.filter(flower => flower.location === currentLocation);
    setFlowers(filteredFlowers);
    console.log('Lugar actual:', currentLocation, 'Flores filtradas:', filteredFlowers);
  }, [currentLocation, allFlowers]);

  // Filtrar dibujos por lugar actual
  useEffect(() => {
    const filteredDrawings = drawings.filter(drawing => drawing.location === currentLocation);
    // Esto se usará en GardenWorld para renderizar los dibujos
  }, [currentLocation, drawings]);

  useEffect(() => {
    // Cargar nombre guardado
    const savedName = localStorage.getItem('cozyUserName');
    if (savedName) {
      setUserName(savedName);
      setMyPlayer(prev => ({ ...prev, id: savedName }));
    }
    setLoading(false);
  }, []);

  // Guardar y cargar última sala
  useEffect(() => {
    if (roomId) {
      localStorage.setItem('cozyLastRoom', roomId);
    }
  }, [roomId]);

  // Reconectar a última sala si existe
  useEffect(() => {
    if (userName && !roomId) {
      const lastRoom = localStorage.getItem('cozyLastRoom');
      if (lastRoom) {
        joinRoom(lastRoom);
      }
    }
  }, [userName]);

  const createRoom = async () => {
    if (!userName) return;
    
    const newRoomId = Date.now().toString();
    const roomRef = ref(database, `rooms/${newRoomId}`);
    
    await set(roomRef, {
      createdAt: Date.now(),
      createdBy: userName
    });

    setRoomId(newRoomId);
    joinRoom(newRoomId);
    return newRoomId;
  };

  const joinRoom = async (roomIdToJoin) => {
    if (!userName) return;

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
        console.log('Array de flores sin filtrar:', flowersArray);
        setAllFlowers(flowersArray);
      } else {
        console.log('No hay flores en la sala');
        setAllFlowers([]);
      }
    });

    const drawingsRef = ref(database, `rooms/${roomIdToJoin}/drawings`);
    const unsubscribeDrawings = onValue(drawingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const drawingsArray = Object.entries(data).map(([id, drawing]) => ({ id, ...drawing }));
        setDrawings(drawingsArray);
      } else {
        setDrawings([]);
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
    await update(ref(database, `rooms/${roomIdToJoin}/players/${userName}`), {
      id: userName,
      emoji: myPlayer.emoji,
      x: myPlayer.x,
      y: myPlayer.y,
      message: '',
      messageTime: null,
      lastSeen: Date.now(),
      location: currentLocation
    });

    return () => {
      unsubscribePlayers();
      unsubscribeFlowers();
      unsubscribeDrawings();
      unsubscribeRoom();
    };
  };

  const updatePosition = async (x, y) => {
    if (!userName || !roomId) return;

    setMyPlayer(prev => ({ ...prev, x, y }));

    await update(ref(database, `rooms/${roomId}/players/${userName}`), {
      x,
      y,
      lastSeen: Date.now(),
      location: currentLocation
    });
  };

  const sendMessage = async (message) => {
    if (!userName || !roomId) return;

    const now = Date.now();
    setMyPlayer(prev => ({ ...prev, message, messageTime: now }));

    await update(ref(database, `rooms/${roomId}/players/${userName}`), {
      message,
      messageTime: now,
      location: currentLocation
    });

    // Limpiar mensaje después de 5 segundos
    setTimeout(async () => {
      await update(ref(database, `rooms/${roomId}/players/${userName}`), {
        message: '',
        messageTime: null,
        location: currentLocation
      });
      setMyPlayer(prev => ({ ...prev, message: '', messageTime: null }));
    }, 5000);
  };

  const changeEmoji = async (emoji) => {
    if (!userName || !roomId) return;

    setMyPlayer(prev => ({ ...prev, emoji }));

    await update(ref(database, `rooms/${roomId}/players/${userName}`), {
      emoji,
      location: currentLocation
    });
  };

  const plantFlower = async (x, y, type) => {
    if (!userName || !roomId) return;

    const newFlower = {
      type,
      x,
      y,
      stage: 0, // 0: semilla, 1: brote, 2: flor pequeña, 3: flor madura
      water: 50,
      plantedAt: Date.now(),
      lastWatered: null,
      plantedBy: userName,
      location: currentLocation
    };

    const flowerId = Date.now().toString();
    console.log('Plantando flor:', flowerId, newFlower);
    await update(ref(database, `rooms/${roomId}/flowers/${flowerId}`), newFlower);
  };

  const changeLocation = async (location) => {
    if (!userName || !roomId) return;

    setCurrentLocation(location);
    
    await update(ref(database, `rooms/${roomId}/players/${userName}`), {
      location
    });
  };

  const waterFlower = async (flowerId) => {
    if (!userName || !roomId) return;

    const flower = flowers.find(f => f.id === flowerId);
    if (!flower) return;

    const newWater = Math.min(100, flower.water + 10);
    let newStage = flower.stage;

    // La flor crece si tiene suficiente agua
    if (newWater >= 100 && flower.stage < 3) {
      newStage = flower.stage + 1;
    }

    await update(ref(database, `rooms/${roomId}/flowers/${flowerId}`), {
      water: newWater,
      stage: newStage,
      lastWatered: Date.now()
    });
  };

  const changeBackground = async (bg) => {
    if (!userName || !roomId) return;

    setBackground(bg);
    await update(ref(database, `rooms/${roomId}`), {
      background: bg
    });
  };

  const changeAccessory = async (accessory) => {
    if (!userName || !roomId) return;

    setMyPlayer(prev => ({ ...prev, accessory }));

    await update(ref(database, `rooms/${roomId}/players/${userName}`), {
      accessory,
      location: currentLocation
    });
  };

  const addDrawing = async (points) => {
    if (!userName || !roomId) return;

    const drawingId = Date.now().toString();
    await update(ref(database, `rooms/${roomId}/drawings/${drawingId}`), {
      points,
      location: currentLocation,
      createdBy: userName,
      createdAt: Date.now()
    });
  };

  const deleteDrawing = async (drawingId) => {
    if (!userName || !roomId) return;
    await remove(ref(database, `rooms/${roomId}/drawings/${drawingId}`));
  };

  const deleteAllDrawings = async (location) => {
    if (!userName || !roomId) return;
    const filteredDrawings = drawings.filter(d => d.location === location);
    for (const drawing of filteredDrawings) {
      await remove(ref(database, `rooms/${roomId}/drawings/${drawing.id}`));
    }
  };

  const value = {
    user: userName,
    roomId,
    players,
    flowers,
    drawings,
    background,
    currentLocation,
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
    changeAccessory,
    changeLocation,
    addDrawing,
    deleteDrawing,
    deleteAllDrawings,
    setUsername: handleSetUsername
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

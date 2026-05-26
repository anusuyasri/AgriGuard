import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5000';

let sharedSocket = null;

export function useSocket() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!sharedSocket) {
      sharedSocket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });
    }

    const socket = sharedSocket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('sensor_update', (data) => {
      setLatest(data);
      setHistory(prev => {
        const next = [...prev, { ...data, time: new Date(data.timestamp * 1000).toLocaleTimeString() }];
        return next.slice(-50);
      });
    });

    return () => {
      socket.off('sensor_update');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return { latest, history, connected };
}

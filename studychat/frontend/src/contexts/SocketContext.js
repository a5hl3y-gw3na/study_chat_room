import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const { user } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:3001', {
        transports: ['websocket'],
        upgrade: false
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        setConnected(true);
        
        // Send user connection data
        newSocket.emit('user_connect', {
          userId: user.id,
          username: user.username
        });
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from chat server');
        setConnected(false);
        toast.error('Disconnected from chat server');
      });

      newSocket.on('connection_confirmed', (data) => {
        console.log('Connection confirmed:', data.message);
        toast.success('Connected to chat server');
      });

      // Room event handlers
      newSocket.on('room_joined', (data) => {
        console.log('Joined room:', data.roomName);
        setCurrentRoom({
          id: data.roomId,
          name: data.roomName
        });
        setMessages([]); // Clear previous messages
        toast.success(`Joined ${data.roomName}`);
      });

      newSocket.on('user_joined', (data) => {
        console.log('User joined:', data.username);
        setRoomUsers(data.roomUsers || []);
        
        // Add system message
        const systemMessage = {
          id: `system_${Date.now()}`,
          username: 'System',
          message: data.message,
          timestamp: data.timestamp,
          isSystem: true
        };
        setMessages(prev => [...prev, systemMessage]);
      });

      newSocket.on('user_left', (data) => {
        console.log('User left:', data.username);
        setRoomUsers(data.roomUsers || []);
        
        // Add system message
        const systemMessage = {
          id: `system_${Date.now()}`,
          username: 'System',
          message: data.message,
          timestamp: data.timestamp,
          isSystem: true
        };
        setMessages(prev => [...prev, systemMessage]);
      });

      newSocket.on('room_users_update', (data) => {
        setRoomUsers(data.roomUsers || []);
      });

      // Message event handlers
      newSocket.on('new_message', (data) => {
        console.log('New message:', data);
        setMessages(prev => [...prev, data]);
      });

      // Typing event handlers
      newSocket.on('user_typing', (data) => {
        if (data.isTyping) {
          setTypingUsers(prev => {
            if (!prev.includes(data.username)) {
              return [...prev, data.username];
            }
            return prev;
          });
        } else {
          setTypingUsers(prev => prev.filter(username => username !== data.username));
        }
      });

      // Error handler
      newSocket.on('error', (data) => {
        console.error('Socket error:', data.message);
        toast.error(data.message);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  // Join a chat room
  const joinRoom = (roomId, roomName) => {
    if (socket && connected) {
      socket.emit('join_room', {
        roomId,
        roomName,
        username: user.username
      });
    } else {
      toast.error('Not connected to chat server');
    }
  };

  // Send a message
  const sendMessage = (message) => {
    if (socket && connected && currentRoom) {
      socket.emit('send_message', {
        roomId: currentRoom.id,
        message,
        username: user.username
      });
      return true;
    } else {
      toast.error('Cannot send message - not connected or not in a room');
      return false;
    }
  };

  // Start typing indicator
  const startTyping = () => {
    if (socket && connected && currentRoom) {
      socket.emit('typing_start', {
        roomId: currentRoom.id,
        username: user.username
      });
    }
  };

  // Stop typing indicator
  const stopTyping = () => {
    if (socket && connected && currentRoom) {
      socket.emit('typing_stop', {
        roomId: currentRoom.id,
        username: user.username
      });
    }
  };

  // Leave current room
  const leaveRoom = () => {
    setCurrentRoom(null);
    setMessages([]);
    setRoomUsers([]);
    setTypingUsers([]);
  };

  const value = {
    socket,
    connected,
    currentRoom,
    roomUsers,
    messages,
    typingUsers,
    joinRoom,
    sendMessage,
    startTyping,
    stopTyping,
    leaveRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

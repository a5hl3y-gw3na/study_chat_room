/**
 * Study Chat - Real-time WebSocket Server
 * Node.js + Socket.io Server for handling real-time chat communication
 * Port: 3001
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.io
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000", // React frontend URL
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Enable CORS for Express
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(express.json());

// Store connected users and room information
const connectedUsers = new Map(); // socketId -> user info
const roomUsers = new Map(); // roomId -> Set of user info
const userTyping = new Map(); // roomId -> Set of usernames currently typing

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        connectedUsers: connectedUsers.size,
        activeRooms: roomUsers.size
    });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Handle user joining the server
    socket.on('user_connect', (userData) => {
        try {
            const userInfo = {
                socketId: socket.id,
                userId: userData.userId,
                username: userData.username,
                joinedAt: new Date().toISOString()
            };
            
            connectedUsers.set(socket.id, userInfo);
            console.log(`User ${userData.username} connected with socket ${socket.id}`);
            
            // Send connection confirmation
            socket.emit('connection_confirmed', {
                message: 'Connected to Study Chat server',
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error in user_connect:', error);
            socket.emit('error', { message: 'Failed to connect user' });
        }
    });

    // Handle joining a chat room
    socket.on('join_room', (data) => {
        try {
            const { roomId, roomName, username } = data;
            const userInfo = connectedUsers.get(socket.id);
            
            if (!userInfo) {
                socket.emit('error', { message: 'User not authenticated' });
                return;
            }

            // Leave previous room if any
            const currentRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
            currentRooms.forEach(room => {
                socket.leave(room);
                removeUserFromRoom(room, userInfo);
            });

            // Join new room
            socket.join(roomId);
            addUserToRoom(roomId, userInfo);
            
            console.log(`${username} joined room: ${roomName} (${roomId})`);
            
            // Notify user they joined successfully
            socket.emit('room_joined', {
                roomId,
                roomName,
                message: `Welcome to ${roomName}!`,
                timestamp: new Date().toISOString()
            });
            
            // Notify other users in the room
            socket.to(roomId).emit('user_joined', {
                username,
                message: `${username} joined the room`,
                timestamp: new Date().toISOString(),
                roomUsers: getRoomUsersList(roomId)
            });
            
            // Send current room users to the new user
            socket.emit('room_users_update', {
                roomUsers: getRoomUsersList(roomId)
            });
            
        } catch (error) {
            console.error('Error in join_room:', error);
            socket.emit('error', { message: 'Failed to join room' });
        }
    });

    // Handle sending messages
    socket.on('send_message', (data) => {
        try {
            const { roomId, message, username } = data;
            const userInfo = connectedUsers.get(socket.id);
            
            if (!userInfo) {
                socket.emit('error', { message: 'User not authenticated' });
                return;
            }
            
            if (!message || message.trim().length === 0) {
                socket.emit('error', { message: 'Message cannot be empty' });
                return;
            }
            
            const messageData = {
                id: generateMessageId(),
                username,
                message: message.trim(),
                timestamp: new Date().toISOString(),
                roomId
            };
            
            // Broadcast message to all users in the room (including sender)
            io.to(roomId).emit('new_message', messageData);
            
            console.log(`Message from ${username} in room ${roomId}: ${message.substring(0, 50)}...`);
            
        } catch (error) {
            console.error('Error in send_message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
        try {
            const { roomId, username } = data;
            
            if (!userTyping.has(roomId)) {
                userTyping.set(roomId, new Set());
            }
            
            userTyping.get(roomId).add(username);
            
            // Notify other users in the room
            socket.to(roomId).emit('user_typing', {
                username,
                isTyping: true,
                typingUsers: Array.from(userTyping.get(roomId))
            });
            
        } catch (error) {
            console.error('Error in typing_start:', error);
        }
    });

    socket.on('typing_stop', (data) => {
        try {
            const { roomId, username } = data;
            
            if (userTyping.has(roomId)) {
                userTyping.get(roomId).delete(username);
                
                if (userTyping.get(roomId).size === 0) {
                    userTyping.delete(roomId);
                }
            }
            
            // Notify other users in the room
            socket.to(roomId).emit('user_typing', {
                username,
                isTyping: false,
                typingUsers: userTyping.has(roomId) ? Array.from(userTyping.get(roomId)) : []
            });
            
        } catch (error) {
            console.error('Error in typing_stop:', error);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        try {
            const userInfo = connectedUsers.get(socket.id);
            
            if (userInfo) {
                console.log(`User ${userInfo.username} disconnected`);
                
                // Remove user from all rooms
                const userRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
                userRooms.forEach(roomId => {
                    removeUserFromRoom(roomId, userInfo);
                    
                    // Notify other users in the room
                    socket.to(roomId).emit('user_left', {
                        username: userInfo.username,
                        message: `${userInfo.username} left the room`,
                        timestamp: new Date().toISOString(),
                        roomUsers: getRoomUsersList(roomId)
                    });
                    
                    // Clean up typing indicators
                    if (userTyping.has(roomId)) {
                        userTyping.get(roomId).delete(userInfo.username);
                        if (userTyping.get(roomId).size === 0) {
                            userTyping.delete(roomId);
                        }
                    }
                });
                
                // Remove user from connected users
                connectedUsers.delete(socket.id);
            }
            
            console.log(`Client disconnected: ${socket.id}`);
            
        } catch (error) {
            console.error('Error in disconnect:', error);
        }
    });
});

// Helper functions
function addUserToRoom(roomId, userInfo) {
    if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Set());
    }
    roomUsers.get(roomId).add(userInfo);
}

function removeUserFromRoom(roomId, userInfo) {
    if (roomUsers.has(roomId)) {
        roomUsers.get(roomId).delete(userInfo);
        if (roomUsers.get(roomId).size === 0) {
            roomUsers.delete(roomId);
        }
    }
}

function getRoomUsersList(roomId) {
    if (!roomUsers.has(roomId)) {
        return [];
    }
    return Array.from(roomUsers.get(roomId)).map(user => ({
        username: user.username,
        userId: user.userId,
        joinedAt: user.joinedAt
    }));
}

function generateMessageId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Study Chat Server running on port ${PORT}`);
    console.log(`📡 WebSocket server ready for connections`);
    console.log(`🌐 CORS enabled for http://localhost:3000`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

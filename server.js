const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Просто храним комнаты в памяти
const rooms = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.roomId = roomId;
        console.log(User ${socket.id} joined room: ${roomId});
        
        // Сообщаем другим пользователям о новом участнике
        socket.to(roomId).emit('user-joined', socket.id);
    });

    socket.on('webrtc-offer', (data) => {
        socket.to(data.roomId).emit('webrtc-offer', {
            sdp: data.sdp,
            from: socket.id
        });
    });

    socket.on('webrtc-answer', (data) => {
        socket.to(data.roomId).emit('webrtc-answer', {
            sdp: data.sdp,
            from: socket.id
        });
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data.roomId).emit('ice-candidate', {
            candidate: data.candidate,
            sdpMid: data.sdpMid,
            sdpMLineIndex: data.sdpMLineIndex,
            from: socket.id
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (socket.roomId) {
            socket.to(socket.roomId).emit('user-left', socket.id);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(✅ Signaling server running on port ${PORT});
    console.log(🚀 Ready for WebRTC connections);
});

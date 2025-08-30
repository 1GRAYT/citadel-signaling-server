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

// Храним аудио потоки
const audioStreams = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-voice', (roomId) => {
        socket.join(roomId);
        socket.roomId = roomId;
        console.log(User ${socket.id} joined voice room: ${roomId});
    });

    // Принимаем аудио данные и пересылаем всем в комнате
    socket.on('audio-data', (data) => {
        socket.to(data.roomId).emit('audio-data', {
            audio: data.audio,
            userId: socket.id
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(✅ Voice server running on port ${PORT});
});

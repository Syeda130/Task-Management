// websocket-server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const PORT = process.env.WS_PORT || 3001; // Use a different port than Next.js
const NEXT_APP_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const app = express();
app.use(cors({
    origin: NEXT_APP_URL, // Allow your Next.js app origin
    methods: ["GET", "POST"],
    credentials: true
}));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: NEXT_APP_URL,
        methods: ["GET", "POST"],
        credentials: true
    }
    // No need for 'path' option here if it's the root of this server
});

const connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log(`[WS Server] 🔌 Socket connected: ${socket.id}`);

    // Get userId passed from client query during connection
    const userIdFromQuery = socket.handshake.query.userId;
    if (userIdFromQuery) {
        console.log(`[WS Server] 🔗 User ${userIdFromQuery} attempting to join from query.`);
        socket.join(userIdFromQuery.toString());
        connectedUsers.set(socket.id, userIdFromQuery.toString());
    }


    socket.on('join', (userId) => { // Still listen for explicit join too
        if (userId) {
            console.log(`[WS Server] 🔗 User ${userId} joined explicitly with socket ${socket.id}`);
            // If already joined via query, this is fine. If not, join now.
            if (!connectedUsers.has(socket.id) || connectedUsers.get(socket.id) !== userId.toString()) {
                socket.join(userId.toString());
                connectedUsers.set(socket.id, userId.toString());
            }
        }
    });

    socket.on('disconnect', (reason) => {
        console.log(`[WS Server] 🔌 Socket disconnected: ${socket.id}, Reason: ${reason}`);
        const userId = connectedUsers.get(socket.id);
        if (userId) {
            console.log(`[WS Server] 🔗 User ${userId} left.`);
            connectedUsers.delete(socket.id);
        }
    });

    socket.on('clientPing', () => {
         socket.emit('serverPong');
     });

    // How Next.js API routes will send messages to this server:
    // Add a simple HTTP endpoint on this WS server for Next.js to call
    app.post('/send-notification', express.json(), (req, res) => {
        const { targetUserId, eventName, data } = req.body;
        if (targetUserId && eventName && data) {
            console.log(`[WS Server] Received HTTP request to send '${eventName}' to user ${targetUserId}`);
            io.to(targetUserId.toString()).emit(eventName, data);
            res.status(200).json({ success: true, message: 'Event emitted' });
        } else {
            res.status(400).json({ success: false, message: 'Missing targetUserId, eventName, or data' });
        }
    });
});

server.listen(PORT, () => {
    console.log(`[WS Server] 🚀 WebSocket server listening on port ${PORT}`);
});
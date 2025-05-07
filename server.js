// server.js
const next = require('next');
const http = require('http');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server, {
    cors: {
      origin: '*', // Update this to your frontend domain in production
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('WebSocket connected:', socket.id);

    socket.on('message', (msg) => {
      console.log('Received:', msg);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
const app = express();
import { createServer } from 'http';
const server = createServer(app);
import { Server } from 'socket.io';
const io = new Server(server);

// workaround for __dirname in ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//tracks number of live users
let userCount = 0

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  userCount++
  socket.broadcast.emit('user connected', userCount)
  socket.on('disconnect', () => {
    userCount--
    socket.broadcast.emit('user disconnected', userCount)
    console.log('user disconnected');
  });
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
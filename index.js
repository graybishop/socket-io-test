import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path'
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import livereload from 'livereload'
import connectLivereload from 'connect-livereload';

const app = express();
const server = createServer(app);
const io = new Server(server);

// workaround for __dirname in ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const liveReloadServer = livereload.createServer()
liveReloadServer.watch(__dirname)

app.use(connectLivereload())

//tracks number of live users
let userCount = 0

app.use(express.static(path.join(__dirname, 'public')));
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
  socket.on('chat message', (msg, nickname) => {
    io.emit('chat message', msg, nickname);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
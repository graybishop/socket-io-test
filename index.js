import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';


const app = express();
const server = createServer(app);
const io = new Server(server,{
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});
const PORT = process.env.PORT || 3001;

// workaround for __dirname in ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//tracks  live users
let users = [];

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.use(express.static(path.join(__dirname, 'client/src')));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    let disconnectedUserIndex = users.findIndex(({ socketId }) => {
      return socketId == socket.id;
    });
    if (disconnectedUserIndex !== -1) {
      socket.broadcast.emit('user disconnected', users.splice(disconnectedUserIndex, 1)[0]);
    }
  });
  socket.on('chat message', (msg, { nickname, userColor }) => {
    io.emit('chat message', msg, { nickname, userColor });
  });
  socket.on('user created', (user) => {
    users.push(user);
    socket.broadcast.emit('user connected', users);
  });
  socket.on('user typing', (user) => {
    socket.broadcast.emit('user typing', user);
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
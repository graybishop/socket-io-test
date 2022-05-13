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

//tracks  live users
let users = []

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => { 
  socket.on('disconnect', () => {
    let disconnectedUserIndex = users.findIndex(({socketId})=>{
      return socketId == socket.id
    })
    if(disconnectedUserIndex !== -1){
      socket.broadcast.emit('user disconnected', users.splice(disconnectedUserIndex, 1)[0])
    }
  });
  socket.on('chat message', (msg, {nickname, userColor}) => {
    io.emit('chat message', msg, {nickname, userColor});
  });
  socket.on('user created', (user)=>{
    users.push(user)
    socket.broadcast.emit('user connected', users)
  })
  socket.on('user typing', (user)=>{
    socket.broadcast.emit('user typing', user)
  })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
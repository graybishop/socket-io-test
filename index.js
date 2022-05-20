import 'dotenv/config'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import morgan from 'morgan';

let logger = morgan('dev')
const app = express();
const server = createServer(app);
const io = new Server(server, {
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

app.use(logger)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.use(express.static(path.join(__dirname, 'client/src')));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('need room', (callback)=>{
    callback({
      newRoom: 'test-room'
    })
  })
  socket.on('disconnect', () => {
    let disconnectedUserIndex = users.findIndex(element => {
      return element.socket === socket.id;
    });
    if (disconnectedUserIndex !== -1) {
      socket.broadcast.emit('user disconnected', users[disconnectedUserIndex]);
      users = users.filter(element =>{
        return element.socket !== socket.id
      })
    }
  });
  socket.on('chat message', (msg, user) => {
    io.emit('chat message', msg, user);
  });
  socket.on('user created', (user) => {
    //react strict mode runs useEffect twice in dev mode. This scans for duplicate before adding to the array.
    if (users.findIndex(element => {
      return element.socket === socket.id
    }) === -1) {
      users.push({ ...user, socket: socket.id });
      socket.broadcast.emit('user connected', users);
    }
  }
  );
  socket.on('user typing', (user) => {
    socket.broadcast.emit('user typing', user);
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
const app = express();
import { createServer } from 'http';
const server = createServer(app);
import { Server } from 'socket.io'
const io = new Server(server);

// workaround for __dirname in ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket)=>{
  console.log('a user connected')
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
})

server.listen(3000, () => {
  console.log('listening on *:3000');
});
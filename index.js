import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
const app = express();
import { createServer } from 'http';
const server = createServer(app);

// workaround for __dirname in ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
let socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
  }
});

const appendNewMessage = msgText => {
  const item = document.createElement('li');
  item.textContent = msgText;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
};

socket.on('chat message', (msg) => {
  appendNewMessage(msg);
});

socket.on('user connected', (userCount) => {
  appendNewMessage(`A user has connected. Current User Count: ${userCount}`);
});

socket.on('user disconnected', (userCount) => {
  appendNewMessage(`A user has disconnected. Current User Count: ${userCount}`);
});
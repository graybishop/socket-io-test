const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');

const appendNewMessage = msgText => {
  const item = document.createElement('li');
  item.textContent = msgText;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
};

let nickname = ''
if (!nickname){
  appendNewMessage('Please enter your nickname below 📜.')
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if(input.value && !nickname){
    nickname = input.value
    appendNewMessage(`Welcome to the chat ${nickname}.`)
    input.value = '';
  }

  if (input.value && nickname) {
    socket.emit('chat message', input.value, nickname);
    input.value = '';
  }
});

socket.on('chat message', (msg, nickname) => {
  appendNewMessage(`${nickname}: ${msg}`);
});

socket.on('user connected', (userCount) => {
  appendNewMessage(`A user has connected. Current User Count: ${userCount}`);
});

socket.on('user disconnected', (userCount) => {
  appendNewMessage(`A user has disconnected. Current User Count: ${userCount}`);
});
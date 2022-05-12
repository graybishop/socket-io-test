const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const button = document.getElementById('submitButton');

const appendNewMessage = (msgText, msgColor, formatted) => {
  const item = document.createElement('li');
  formatted ?
    item.innerHTML = msgText
    :
    item.textContent = msgText;

  if (msgColor) {
    item.style.color = msgColor;
  }
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
};

const appendUserList = (users) => {
  const item = document.createElement('li');
  item.textContent = `A user has connected. Current User Count: ${users.length}. Users: `;
  messages.appendChild(item);
  users.forEach(({ nickname, userColor }, index) => {
    const span = document.createElement('span');
    span.style.color = userColor;
    span.style.fontWeight = 'bold';
    index != users.length - 1 ?
      span.textContent = `${nickname}, `
      :
      span.innerHTML = `<span style='font-weight:normal; color:initial'>and</span> ${nickname}.`;
    item.appendChild(span);
  });
  window.scrollTo(0, document.body.scrollHeight);
};

const generateColor = () => {
  const letters = '0123456789ABCDEF'.split('');
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.round(Math.random() * 15)];
  }
  return color;
};

let nickname = '';
if (!nickname) {
  appendNewMessage('Please enter your nickname below 📜.');
  button.textContent = 'Submit Nickname';
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (input.value && !nickname) {
    nickname = input.value;
    userColor = generateColor();
    appendNewMessage(`Welcome to the chat ${nickname}.`, userColor);
    const user = {
      nickname,
      userColor,
      guid: nickname + userColor,
      socketId: socket.id
    };
    socket.emit('user created', user);
    button.textContent = 'Send';
    input.value = '';
  }

  if (input.value && nickname) {
    socket.emit('chat message', input.value, { nickname, userColor });
    input.value = '';
  }
});

socket.on('chat message', (msg, { nickname, userColor }) => {
  appendNewMessage(`${nickname}: ${msg}`, userColor);
});

socket.on('user connected', (users) => {
  appendUserList(users);
});

socket.on('user disconnected', (user) => {
  appendNewMessage(`<span style ='font-weight:bold'>${user.nickname}</span><span style='color:initial'> has disconnected.</span>`, user.userColor, true);
});
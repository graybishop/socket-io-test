const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const button = document.getElementById('submitButton');
const typingUsersDiv = document.getElementById('typing-users');

const user = {
  nickname: '',
  userColor: '',
  guid: '',
  socketId: socket.id
};

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
  if (users.length > 1) {
    users.forEach(({ nickname, userColor }, index) => {
      const span = document.createElement('span');
      span.style.color = userColor;
      span.style.fontWeight = 'bold';
      index != users.length - 1 ?
        span.textContent = `${nickname}${users.length > 2 ? ',' : ''} `
        :
        span.innerHTML = `<span style='font-weight:normal; color:white'>and</span> ${nickname}.`;
      item.appendChild(span);
    });
  } else {
    const span = document.createElement('span');
    span.style.color = users[0].userColor;
    span.style.fontWeight = 'bold';
    span.textContent = `${users[0].nickname}.`;
    item.appendChild(span);
  }

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

if (!user.nickname) {
  appendNewMessage('Please enter your nickname below 📜.');
  button.textContent = 'Submit Nickname';
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (input.value && !user.nickname) {
    user.nickname = input.value;
    user.userColor = generateColor();
    user.guid = user.nickname + user.userColor;
    appendNewMessage(`Welcome to the chat ${user.nickname}.`, user.userColor);
    socket.emit('user created', user);
    button.textContent = 'Send';
    input.value = '';
  }

  if (input.value && user.nickname) {
    socket.emit('chat message', input.value, user);
    input.value = '';
  }
});

input.addEventListener('input', (e) => {
  if (input.value && user.guid) {
    socket.emit('user typing', user);
  }
});

socket.on('chat message', (msg, { nickname, userColor }) => {
  appendNewMessage(`${nickname}: ${msg}`, userColor);
});

socket.on('user connected', (users) => {
  appendUserList(users);
});

socket.on('user disconnected', (user) => {
  appendNewMessage(`<span style ='font-weight:bold'>${user.nickname}</span><span style='color:white'> has disconnected.</span>`, user.userColor, true);
});

const typingUsers = [];
socket.on('user typing', user => {
  if (!typingUsers.some(value => {
    return value.guid === user.guid;
  })) {
    typingUsers.push(user);
  }

  typingUsersDiv.innerText = JSON.stringify(typingUsers[0].nickname);
});
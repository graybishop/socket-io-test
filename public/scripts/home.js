const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const button = document.getElementById('submitButton');

const appendNewMessage = (msgText, msgColor) => {
  const item = document.createElement('li');
  item.textContent = msgText;
  if (msgColor){
    item.style.color = msgColor
  }
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
};

const formatUserList = (userListArray) => {
  if (userListArray.length === 0) {
    return;
  }
  let formattedString = '';
  userListArray.forEach(({nickname}, index) => {
    //Add commas between each nickname, on last entry add an 'and' before the user
    index != userListArray.length - 1 ?
      formattedString = formattedString + `${nickname}, `
      :
      formattedString = formattedString + `and ${nickname}.`;
  });
  return formattedString;
};

const generateColor = ()=>{
  const letters = '0123456789ABCDEF'.split('');
  let color = '#';
  for (let i = 0; i < 6; i++ ) {
      color += letters[Math.round(Math.random() * 15)];
  }
  return color;
}

let nickname = '';
if (!nickname) {
  appendNewMessage('Please enter your nickname below 📜.');
  button.textContent = 'Submit Nickname';
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (input.value && !nickname) {
    nickname = input.value;
    userColor = generateColor()
    appendNewMessage(`Welcome to the chat ${nickname}.`, userColor);
    socket.emit('user created', {nickname, userColor});
    button.textContent = 'Send';
    input.value = '';
  }

  if (input.value && nickname) {
    socket.emit('chat message', input.value, {nickname, userColor});
    input.value = '';
  }
});

socket.on('chat message', (msg, {nickname, userColor}) => {
  appendNewMessage(`${nickname}: ${msg}`, userColor);
});

socket.on('user connected', (userCount, users) => {
  appendNewMessage(`A user has connected. Current User Count: ${userCount}. Users: ${formatUserList(users)}`);
});

socket.on('user disconnected', (userCount) => {
  appendNewMessage(`A user has disconnected. Current User Count: ${userCount}`);
});
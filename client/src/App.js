import './App.css';
import { io } from "socket.io-client";
import { useState } from 'react';
const socket = io();

const App = () => {

  const [messageList, updateMessageList] = useState([]);
  const [user, updateUser] = useState({
    nickname: '',
    userColor: '',
    guid: '',
    socketId: socket.id
  });
  const [buttonText, UpdateButtonText] = useState('Send');

  const form = document.getElementById('form');
  const input = document.getElementById('input');
  const button = document.getElementById('submitButton');
  const typingUsersDiv = document.getElementById('typing-users');
  const messages = document.getElementById('messages');

  const appendNewMessage = (msgText, msgColor, formatted) => {
    const item = document.createElement('li');
    formatted ?
      item.innerHTML = msgText
      :
      item.textContent = msgText;

    if (msgColor) {
      item.style.color = msgColor;
    }
    messageList.push(item);
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
    UpdateButtonText('Submit Nickname');
  }

  const handleSubmit = (e) => {
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
  };

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

  let typingUsers = [];
  socket.on('user typing', user => {

    const updateTypingHtml = userArray => {
      typingUsersDiv.innerHTML = '';
      console.log(userArray);

      const createColoredNameSpan = (userData) => {
        const span = document.createElement('span');
        span.style.color = userData.userColor;
        span.innerText = userData.nickname;
        return span;
      };

      if (userArray.length === 0) {
        return;
      }

      if (userArray.length === 1) {
        typingUsersDiv.innerHTML = '';
        typingUsersDiv.appendChild(createColoredNameSpan(userArray[0]));
        typingUsersDiv.insertAdjacentHTML('beforeend', ' is typing...');
        return;
      }

      if (userArray.length > 1) {
        typingUsersDiv.innerHTML = '';
        typingUsersDiv.appendChild(createColoredNameSpan(userArray[0]));
        typingUsersDiv.insertAdjacentHTML('beforeend', ' and others are typing...');
        return;
      }
    };

    const removeTypingUserFromArray = () => {
      typingUsers = typingUsers.filter(element => {
        return element.guid !== user.guid;
      });
      updateTypingHtml(typingUsers);
    };

    const timeoutSetUp = () => {
      return setTimeout(() => {
        removeTypingUserFromArray();
      }, 1250);
    };

    //if typingUsers does not contain the user we have received
    //then add the user to the typingUsers array, after setting up
    //a cooldown that removes it.
    const receivedUserIndex = typingUsers.findIndex(element => {
      return element.guid === user.guid;
    });
    if (receivedUserIndex === -1) {
      const timeoutId = timeoutSetUp();
      let modifiedUser = { ...user, timeoutId };
      typingUsers.push(modifiedUser);
    } else {
      clearTimeout(typingUsers[receivedUserIndex].timeoutId);
      const timeoutId = timeoutSetUp();
      typingUsers[receivedUserIndex].timeoutId = timeoutId;
    }

    updateTypingHtml(typingUsers);
  });


  return (
    <div className='body'>
      <MessageList messageList />
      <div id="input-container">
        <div id="typing-users">
          This will display who is typing...
        </div>
        <form onSubmit={handleSubmit} id="form" action="">
          <input id="input" autoComplete="off" /><SubmitButton buttonText />
        </form>
      </div>
      <script src="/socket.io/socket.io.js"></script>
      <script src="http://chancejs.com/chance.min.js"></script>
    </div>
  );

};

const MessageList = (props) => {
  return (
    <ul>
      {props.messageList.map((element => {
        return (
          <Message msgText={element.msgText} msgColor={element.msgColor} formatted={element.formatted} />
        );
      }))}
    </ul>
  );
};

const Message = ({ msgText, msgColor, formatted }) => {
  return (
    <li style={{ color: msgColor }}>
      {msgText}
    </li>
  );
};

const SubmitButton = ({ buttonText }) => {
  return (
    <button>{buttonText}</button>
  );
};

export default App;

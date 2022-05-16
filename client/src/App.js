import './App.css';
import MessageList from './components/MessageList.js';
import SubmitButton from './components/SubmitButton.js';

import { useEffect, useRef, useState } from 'react';
import { socket } from './socket-config.js';

const App = () => {

  const [messageList, setMessageList] = useState([]);
  const [user, setUser] = useState({
    nickname: '',
    userColor: '',
    guid: '',
    socketId: null
  });
  const [buttonText, setButtonText] = useState('Submit Nickname');
  const [firstTime, updateFirstTime] = useState(true);
  const [value, setValue] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const typingUsersDiv = useRef(null);

  const appendNewMessage = (msgText, msgColor, formatted) => {
    setMessageList((prevState) => {
      return [...prevState, { msgText, msgColor, formatted }];
    });
  };

  //helper function - returns a random hex color as a string
  const generateColor = () => {
    const letters = '0123456789ABCDEF'.split('');
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.round(Math.random() * 15)];
    }
    return color;
  };

  //form submission handler - checks if there is text in the message box, and if the user has registered
  const handleSubmit = (e) => {
    e.preventDefault();

    if (value) {
      if (!user.nickname) {
        const tempUser = {
          nickname: value,
          userColor: generateColor(),
          socket: socket.id
        };
        tempUser.guid = tempUser.nickname + tempUser.userColor;
        appendNewMessage(`Welcome to the chat ${tempUser.nickname}.`, tempUser.userColor);
        socket.emit('user created', tempUser);
        setUser({ ...tempUser });
        setButtonText('Send');
        setValue('');
        return;
      } else {
        socket.emit('chat message', value, user);
        setValue('');
        return;
      }
    }
  };

  //controlled component/ when user types in message, the value State is updated to the input string.
  const handleInput = (e) => {
    setValue(e.target.value);
  };

  //controls the text inside of the typing div. Can be refactored/extracted into it's own component. 
  //should refactor to remove all of the direct html manipulation, and the typingUserDiv ref
  useEffect(() => {

    const updateTypingSection = () => {
      typingUsersDiv.current.innerHTML = '';

      const createColoredNameSpan = (userData) => {
        const span = document.createElement('span');
        span.style.color = userData.userColor;
        span.innerText = userData.nickname;
        return span;
      };

      if (typingUsers.length === 0) {
        return;
      }

      if (typingUsers.length === 1) {
        typingUsersDiv.current.innerHTML = '';
        typingUsersDiv.current.appendChild(createColoredNameSpan(typingUsers[0]));
        typingUsersDiv.current.insertAdjacentHTML('beforeend', ' is typing...');
        return;
      }

      if (typingUsers.length > 1) {
        typingUsersDiv.current.innerHTML = '';
        typingUsersDiv.current.appendChild(createColoredNameSpan(typingUsers[0]));
        typingUsersDiv.current.insertAdjacentHTML('beforeend', ' and others are typing...');
        return;
      }
    };
    updateTypingSection();
  });

  useEffect(() => {
    //if user is typing a message, and has registered, emits a custom event to server 
    if (value && user.guid) {
      socket.emit('user typing', user);
    }
  }, [value, user]);

  //subscribes and unsubscribes socket event listeners
  useEffect(() => {
    socket.on('chat message', (msg, { nickname, userColor }) => {
      appendNewMessage(`${nickname}: ${msg}`, userColor);
    });

    socket.on('user connected', (users) => {
      let userSection = (
        <span>
          {users.length > 1 ?
            users.map(({ nickname, userColor }, index) => {
              let userSpanStyle = { color: userColor, fontWeight: 'bold' };

              return index !== users.length - 1 ? (
                <span style={userSpanStyle}>{nickname}, </span>
              ) :
                (<span>
                  <span >and </span>
                  <span style={userSpanStyle}>{nickname}.</span>
                </span>);
            }) : (<span>{users[0].nickname}.</span>)}
        </span>
      );

      let message = (
        <span>
          <span>A user has connected. Current User Count: {users.length}. Users: </span> {userSection}
        </span>
      );

      appendNewMessage(message);
    });

    socket.on('user disconnected', (user) => {
      let message = (
        <span><span style={{ color: user.userColor }}>{user.nickname}</span> has disconnected.</span>
      );
      appendNewMessage(message);
    });

    socket.on('user typing', user => {


      const removeTypingUserFromArray = () => {
        setTypingUsers(prevState => {
          return [...prevState.filter(element => {
            return element.guid !== user.guid;
          })];
        });
      };

      const timeoutSetUp = () => {
        return setTimeout(() => {
          removeTypingUserFromArray();
        }, 1200);
      };

      //if typingUsers does not contain the user we have received
      //then add the user to the typingUsers array, after setting up
      //a cool down that removes it.
      const receivedUserIndex = typingUsers.findIndex(element => {
        return element.guid === user.guid;
      });
      if (receivedUserIndex === -1) {
        const timeoutId = timeoutSetUp();
        let modifiedUser = { ...user, timeoutId };
        setTypingUsers(prevState => {
          return [...prevState, modifiedUser];
        });
      } else {
        clearTimeout(typingUsers[receivedUserIndex].timeoutId);
        const timeoutId = timeoutSetUp();
        typingUsers[receivedUserIndex].timeoutId = timeoutId;
      }
    });

    return () => {
      socket.off('chat message');
      socket.off('user connected');
      socket.off('user disconnected');
      socket.off('user typing');
    };
  }, [typingUsers]);

  if (firstTime) {
    updateFirstTime(false);
    appendNewMessage('Please enter your nickname below 📜.');
  }

  return (
    <div className='body'>
      <MessageList messageList={messageList} />
      <div id="input-container">
        <div id="typing-users" ref={typingUsersDiv}></div>
        <form onSubmit={handleSubmit} id="form" action="">
          <input onInput={handleInput} id='input' value={value} autoComplete="off" /><SubmitButton buttonText={buttonText} />
        </form>
      </div>
      <script src="/socket.io/socket.io.js"></script>
    </div>
  );

};

export default App;

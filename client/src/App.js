import './App.css';
import MessageList from './components/MessageList.js';
import SubmitButton from './components/SubmitButton.js';
import TypingUsers from './components/TypingUsers.js';

import { useEffect, useState } from 'react';
import { socket } from './socket-config.js';

const App = () => {

  const [messageList, setMessageList] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [buttonText, setButtonText] = useState('Submit Nickname');
  const [value, setValue] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);

  const appendNewMessage = (msgText, msgColor, unique) => {
    setMessageList((prevState) => {
      if (prevState.length === 0) {
        return [...prevState, { msgText, msgColor }];
      }

      if (!unique) {
        return [...prevState, { msgText, msgColor }];
      } else {
        return prevState[prevState.length - 1].msgText === msgText ? [...prevState] : [...prevState, { msgText, msgColor }];
      }
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
      if (user === null) {
        const tempUser = {
          nickname: value,
          userColor: generateColor(),
          socket: socket.id
        };
        tempUser.guid = tempUser.nickname + tempUser.userColor;
        appendNewMessage(`Welcome to the chat ${tempUser.nickname}.`, tempUser.userColor);
        socket.emit('user created', tempUser);
        localStorage.setItem('user', JSON.stringify(tempUser));
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

  useEffect(() => {
    //if user is typing a message, and has registered, emits a custom event to server 
    if (value && user !== null) {
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
                <span style={userSpanStyle} key={index}>{nickname}, </span>
              ) :
                (<span key={index}>
                  <span>and </span>
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

  useEffect(() => {
    if (user === null) {
      appendNewMessage('Please enter your nickname below 📜.', '', true);
    } else {
      appendNewMessage(<span>Welcome back to the chat <span style={{ color: user.userColor }}>{user.nickname}.</span></span>, '', true);
    }
  }, [user]);


  return (
    <div className='body'>
      <MessageList messageList={messageList} />
      <div id="input-container">
        <TypingUsers typingUsers={typingUsers} />
        <form onSubmit={handleSubmit} id="form" action="">
          <input onInput={handleInput} id='input' value={value} autoComplete="off" /><SubmitButton buttonText={buttonText} />
        </form>
      </div>
      <script src="/socket.io/socket.io.js"></script>
    </div>
  );

};

export default App;

import './App.css';
import MessageList from './components/MessageList.js';
import SubmitButton from './components/SubmitButton.js';
import TypingUsers from './components/TypingUsers.js';

import { useEffect, useState } from 'react';
import { socket } from './socket-config.js';

const sysAuthorString = 'SYSTEM'

const App = () => {

  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [messageList, setMessageList] = useState(user !== null ?
    [{ msgText: <span>Welcome back to the chat <span style={{ color: user.userColor }}>{user.nickname}.</span></span>, author: sysAuthorString }] :
    [{ msgText: 'Please enter your nickname below 📜.', author: sysAuthorString }]);
  const [buttonText, setButtonText] = useState('Submit Nickname');
  const [value, setValue] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(()=>{
    if (user !== null){
      socket.emit('user created', user)
    }
  }, [user])

  const appendNewMessage = (msgText, author) => {
    console.log('appending new message', msgText);
    setMessageList((prevState) => {
       return [...prevState, { msgText, author }];
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
        };
        tempUser.guid = tempUser.nickname + tempUser.userColor;
        appendNewMessage(<span>Welcome to the chat <span style={{ color: tempUser.userColor }}>{tempUser.nickname}.</span></span>, sysAuthorString);
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
      let span =(
        <span>
          <span style={{color:userColor, fontWeight:'bold'}}>{nickname}: </span>{msg}
        </span>
      )
      appendNewMessage(span, { nickname, userColor });
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
            }) : (<span style={{ color: users[0].userColor, fontWeight: 'bold' }}>{users[0].nickname}.</span>)}
        </span>
      );

      let message = (
        <span>
          <span>User has connected. Users: </span> {userSection} ({users.length} User{users.length === 1 ? '' : 's'})
        </span>
      );

      appendNewMessage(message, sysAuthorString);
    });

    socket.on('user disconnected', (user) => {
      let message = (
        <span><span style={{ color: user.userColor }}>{user.nickname}</span> has disconnected.</span>
      );
      appendNewMessage(message, sysAuthorString);
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

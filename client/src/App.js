import './App.css';

import { useEffect, useRef, useState } from 'react';
import { socket } from './socket-config.js';

const App = () => {

  const [messageList, setMessageList] = useState([]);
  const [user, setUser] = useState({
    nickname: '',
    userColor: '',
    guid: '',
    socketId: socket.id
  });
  const [buttonText, setButtonText] = useState('Submit Nickname');
  const [firstTime, updateFirstTime] = useState(true);
  const [value, setValue] = useState('');
  // const typingUsers =useRef([])
  const [typingUsers, setTypingUsers] = useState([])
  const typingUsersDiv = useRef(null)

  const appendNewMessage = (msgText, msgColor, formatted) => {
    setMessageList((prevState)=>{
      return [...prevState, {msgText, msgColor, formatted}]
    });
  };

  // const appendUserList = (users) => {
  //   const item = document.createElement('li');
  //   item.textContent = `A user has connected. Current User Count: ${users.length}. Users: `;
  //   messages.appendChild(item);
  //   if (users.length > 1) {
  //     users.forEach(({ nickname, userColor }, index) => {
  //       const span = document.createElement('span');
  //       span.style.color = userColor;
  //       span.style.fontWeight = 'bold';
  //       index !== users.length - 1 ?
  //         span.textContent = `${nickname}${users.length > 2 ? ',' : ''} `
  //         :
  //         span.innerHTML = `<span style='font-weight:normal; color:white'>and</span> ${nickname}.`;
  //       item.appendChild(span);
  //     });
  //   } else {
  //     const span = document.createElement('span');
  //     span.style.color = users[0].userColor;
  //     span.style.fontWeight = 'bold';
  //     span.textContent = `${users[0].nickname}.`;
  //     item.appendChild(span);
  //   }

  //   window.scrollTo(0, document.body.scrollHeight);
  // };

  const generateColor = () => {
    const letters = '0123456789ABCDEF'.split('');
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.round(Math.random() * 15)];
    }
    return color;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (value && !user.nickname) {
      user.nickname = value;
      user.userColor = generateColor();
      user.guid = user.nickname + user.userColor;
      appendNewMessage(`Welcome to the chat ${user.nickname}.`, user.userColor);
      socket.emit('user created', user);
      setButtonText('Send');
      setValue('');
      return
    }

    if (value && user.nickname) {
      socket.emit('chat message', value, user);
      setValue('');
      return
    }
  };

  const handleInput = (e) => {
    setValue(e.target.value);
    if (value.length >= 0  && user.guid) {
      socket.emit('user typing', user);
    }
  };
  
  //controls the text inside of the typing div. Can be refactored/extracted into it's own component. 
  //should refactor to remove all of the direct html manipulation, and the typingUserDiv ref
  useEffect(()=>{
    const updateTypingHtml = () => {
      console.log(`STEP3: array given to update HTML func ${JSON.stringify(typingUsers)}`, typingUsers)
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
        console.log('STEP3: HTML Updated for one user', typingUsers)
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
    updateTypingHtml()
  })

  useEffect(()=>{
    socket.on('chat message', (msg, { nickname, userColor }) => {
      appendNewMessage(`${nickname}: ${msg}`, userColor);
    });

    // socket.on('user connected', (users) => {
    //   appendUserList(users);
    // });

    socket.on('user disconnected', (user) => {
      appendNewMessage(`${user.nickname} has disconnected.</span>`, 'white', true);
    });

    socket.on('user typing', user => {

  
      const removeTypingUserFromArray = () => {
        console.log('running cleanup')
        setTypingUsers(prevState =>{
          console.log(prevState)
          console.log(prevState.filter(element => {
            return element.guid !== user.guid;
          }))
          return [...prevState.filter(element => {
            return element.guid !== user.guid;
          })]
        })
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
      console.log('STEP 1: look for the user in the array', user, receivedUserIndex)
      if (receivedUserIndex === -1) {
        const timeoutId = timeoutSetUp();
        let modifiedUser = { ...user, timeoutId };
        console.log('STEP 2a: if user is not in array, modify object, then add it to the typing users state and call for a state change', modifiedUser)
        setTypingUsers(prevState => {
          return [...prevState, modifiedUser]
        })
      } else {
        clearTimeout(typingUsers[receivedUserIndex].timeoutId);
        const timeoutId = timeoutSetUp();
        typingUsers[receivedUserIndex].timeoutId = timeoutId;
      }
    });

    return () =>{
      socket.off('chat message')
      socket.off('user disconnected')
      socket.off('user typing')
    }
  }, [typingUsers])



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

const MessageList = (props) => {
  const messages = props.messageList.map((element, index) => {
    return (
      <Message msgText={element.msgText} msgColor={element.msgColor} formatted={element.formatted} key={index} latest={index !== props.messageList.length}/>
    );
  });

  return (
    <ul className='messages'>
      {messages}
    </ul>
  );
};

const Message = ({ msgText, msgColor, formatted, latest }) => {
  const listEl = useRef()
  useEffect(()=>{
    if (latest){
      listEl.current.scrollIntoView({ behavior: "smooth" })
    }
  },[latest])

  return (
    <li style={{ color: msgColor }} ref={listEl}>
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

import '../App.css';

import { useEffect, useState } from 'react';
import { socket } from '../socket-config.js';
import { useNavigate, useParams } from 'react-router-dom'

const HomePage = () => {

  const [user] = useState(JSON.parse(localStorage.getItem('user')));

  const navigate = useNavigate()
  const room = useParams().room

  useEffect(()=>{
    if (!room) {
      socket.emit('need room', (response)=>{
        setTimeout(()=>{
          navigate(`/${response.newRoom}`)
        }, 1500)
      })
    } else {
      socket.emit('joining room', room)
    }
  }, [navigate, room])

  return (
    <div className='body'>
      <div>
      {user !==null ? <p>Welcome back {user.nickname}</p> : ''}
      <p>This is the home page. Redirecting you to a chat room.</p>
      </div>
    </div>
  );

};

export default HomePage;

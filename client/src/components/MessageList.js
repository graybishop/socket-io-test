import {useAutoAnimate} from '@formkit/auto-animate/react'
import Message from './Message.js';

const MessageList = (props) => {
  const [parent] = useAutoAnimate()
  console.log(parent)
  const messages = props.messageList.flatMap((element, index) => {
    const latest = index === props.messageList.length - 1
    const msgBlockStyle = {
      paddingBottom: '0',
      paddingTop: '0'
    }
    if (element.author === 'SYSTEM') {
      const systemMsgStyle = {
        fontWeight:'bold'
      }
      return (
        [<Message msgText={element.msgText} key={index} latest={latest} style={systemMsgStyle}/>]
      );
    }
    if (element.author.socket !== props.messageList[index-1].author.socket) {
      const nicknameTitleStyle = {
        color: element.author.userColor,
        fontWeight:'bold',
        paddingBottom: '0'
      }
      return (
        [<Message msgText={element.author.nickname} key={index+'a'} latest={latest} style={nicknameTitleStyle}/>,
        <Message msgText={element.msgText} key={index} latest={latest} style={msgBlockStyle}/>]
      );
    }
    return [<Message msgText={element.msgText} key={index} latest={latest} style={msgBlockStyle}/>]
  });

  return (
    <ul className='messages' ref={parent}>
      {messages}
    </ul>
  );
};

export default MessageList
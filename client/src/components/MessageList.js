import Message from './Message.js';

const MessageList = (props) => {
  const messages = props.messageList.flatMap((element, index) => {
    const msgBlockStyle = {
      paddingLeft: '2rem'
    }
    if (element.author === 'SYSTEM') {
      const systemMsgStyle = {
        fontWeight:'bold'
      }
      return (
        [<Message msgText={element.msgText} key={index} latest={index !== props.messageList.length} style={systemMsgStyle}/>]
      );
    }
    if (element.author.guid !== props.messageList[index-1].author.guid) {
      const nicknameTitleStyle = {
        color: element.author.userColor,
        fontWeight:'bold'
      }
      return (
        [<Message msgText={element.author.nickname} key={index+'a'} latest={index !== props.messageList.length} style={nicknameTitleStyle}/>,
        <Message msgText={element.msgText} key={index} latest={index !== props.messageList.length} style={msgBlockStyle}/>]
      );
    }
    return [<Message msgText={element.msgText} key={index} latest={index !== props.messageList.length} style={msgBlockStyle}/>]
  });

  return (
    <ul className='messages'>
      {messages}
    </ul>
  );
};

export default MessageList
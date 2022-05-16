import Message from './Message.js';

const MessageList = (props) => {
  const messages = props.messageList.map((element, index) => {
    return (
      <Message msgText={element.msgText} msgColor={element.msgColor} key={index} latest={index !== props.messageList.length} />
    );
  });

  return (
    <ul className='messages'>
      {messages}
    </ul>
  );
};

export default MessageList
import Message from './Message.js';

const MessageList = (props) => {
  const messages = props.messageList.flatMap((element, index) => {
    if (element.author === 'SYSTEM') {
      return (
        [<Message msgText={element.author} key={index+'a'} latest={index !== props.messageList.length} />,
        <Message msgText={element.msgText} key={index} latest={index !== props.messageList.length} />]
      );
    }
    if (element.author.guid !== props.messageList[index-1].author.guid) {
      return (
        [<Message msgText={element.author.nickname} key={index+'a'} latest={index !== props.messageList.length} />,
        <Message msgText={element.msgText} key={index} latest={index !== props.messageList.length} />]
      );
    }
    return [<Message msgText={element.msgText} key={index} latest={index !== props.messageList.length} />]
  });

  return (
    <ul className='messages'>
      {messages}
    </ul>
  );
};

export default MessageList
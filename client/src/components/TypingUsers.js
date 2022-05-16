export const TypingUsers = ({ typingUsers }) => {
  let divInnerHTML = null;

  if (typingUsers.length === 1) {
    divInnerHTML = (
      <p><span style={{ color: typingUsers[0].userColor }}>{typingUsers[0].nickname}</span> is typing...</p>
    );
  }

  if (typingUsers.length > 1) {
    divInnerHTML = (
      <p><span style={{ color: typingUsers[0].userColor }}>{typingUsers[0].nickname}</span> and {typingUsers.length - 1} other{typingUsers.length - 1 === 1 ? '' : 's'} are typing...</p>
    );
  }

  return (
    <div>{divInnerHTML}</div>
  );
};

export default TypingUsers;
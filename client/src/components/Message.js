import { useEffect, useRef } from "react";

const Message = ({ msgText, latest }) => {
  //this ref and useEffect are used to enable browser scrollIntoView
  const listEl = useRef();
  useEffect(() => {
    if (latest) {
      listEl.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [latest]);

  return (
    <li ref={listEl}>
      {msgText}
    </li>
  );
};

export default Message
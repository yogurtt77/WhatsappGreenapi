// Message.jsx
import React from "react";

const Message = ({ text, isOutgoing, status }) => {
  return (
    <div className={`message ${isOutgoing ? "outgoing" : "incoming"}`}>
      <div className="message-content">{text}</div>
      {status && <div className="message-status">{status}</div>}
    </div>
  );
};

export default Message;

import { useState } from 'react';
import { IVSChatRoom } from 'amazon-ivs-chat-messaging';

const IVSChat = ({ chatRoomId, chatToken }) => {
  const [messages, setMessages] = useState([]);

  const handleMessage = (message) => {
    setMessages([...messages, message]);
  };

  const handleSend = (message) => {
    const newMessage = {
      text: message,
    };

    IVSChatRoom.sendMessage(chatRoomId, chatToken, newMessage, (error) => {
      if (error) {
        console.error(error);
      }
    });
  };

  return (
    <div>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.text}</li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="Enter your message..."
        onChange={(e) => handleMessage(e.target.value)}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default IVSChat;

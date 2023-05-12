import React, { useState, useEffect, useRef } from 'react';
import { ChatRoom, SendMessageRequest } from 'amazon-ivs-chat-messaging';
import axios from 'axios';
import { Auth } from 'aws-amplify';


const Chat = ({ room_id, chat_token, s_exp, t_exp, userID, userEmail }) => {
  const [messages, setMessages] = useState([]);
  const [messageToSend, setMessageToSend] = useState('');
  const [isSending, setIsSending] = useState(false);

  const inputRef = useRef(null);
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onMessageSend();
    }
  };

  const [room] = useState(() =>
    new ChatRoom({
      regionOrUrl: 'us-east-1',
      tokenProvider: () => {
        return ({
          token: chat_token,
          sessionExpirationTime: new Date(s_exp),
          tokenExpirationTime: new Date(t_exp),
        })
      },
    }),
  );

  const [connectionState, setConnectionState] = useState('disconnected');

  const onMessageSend = async () => {
    const request = new SendMessageRequest(messageToSend, {
      'userEmail': userEmail,
    });
    setIsSending(true);
    setMessageToSend('');

    try {
      const response = await room.sendMessage(request);
    } catch (e) {
      console.log(e);
    } finally {
      setIsSending(false);
    }
  };

  const isSendDisabled = connectionState !== 'connected';

  const SendButton = ({ onPress, disabled }) => {
    return (
      <button
        disabled={disabled}
        onClick={onPress}
        className={`bg-blue-500 text-white font-semibold py-2 px-4 rounded-full ${disabled ? 'opacity-50' : 'hover:bg-blue-700'}`}
      >
        Send
      </button>
    );
  };

  useEffect(() => {
    if (room_id) {
      try {
        fetchMessageHistory();
      } catch (error) {
        console.log('Failed to fetch message history:', error);
      }
    }
  }, [room_id]);
  
  function renameFields(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
  
    if (Array.isArray(obj)) {
      return obj.map(renameFields);
    }
  
    const renamedObj = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = key.charAt(0).toLowerCase() + key.slice(1);
        renamedObj[newKey] = renameFields(obj[key]);
      }
    }
  
    return renamedObj;
  }

  const fetchMessageHistory = async () => {
    try {
      const res = await axios.get(`https://jrn8nltaqj.execute-api.us-east-1.amazonaws.com/prod/chatroom/history/${room_id}`, {
        headers: {
          Authorization: (await Auth.currentSession()).getIdToken().getJwtToken(),
        },
      });
      if (res.status !== 200) {
        console.log(res);
        return;
      } else {
        console.log(res);
        
        // Parse the response data and update messages state
        let parsedHistory = res.data.map((messageString) => JSON.parse(messageString).payload);
        parsedHistory = parsedHistory.map((message) => renameFields(message));
        parsedHistory = parsedHistory.map((item) => {
          const sendTime = new Date(item.sendTime);
          const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
          };
          const formattedSendTime = sendTime.toLocaleString('en-US', options);
          return { ...item, sendTime: formattedSendTime };
        });
  
        console.log("parsed history is: ");
        console.log(parsedHistory);
        
        setMessages(parsedHistory);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const Message = ({ message }) => {
    console.log("message is: ");
    console.log(message);

    const isMine = message.sender.userId === userID;
    console.log(message);

    return (
      <div className={`flex flex-col items-${isMine ? 'end' : 'start'} m-2`}>
        <p className="text-xs text-gray-600">
          {message.attributes.userEmail}
        </p>
        <div
          className={`${isMine ? 'bg-blue-200' : 'bg-gray-300'
            } px-2 py-1 rounded-lg inline-block break-words`}
        >
          <p className="text-sm text-gray-800">{message.content}</p>
        </div>
        <p className="text-xs text-gray-600">
          {/* convert sendTime to string and display */}
          {message.sendTime.toString()}
        </p>
      </div>
    );
  };

  const MessageList = ({ messages }) => {
    return (
      <div className="h-[60vh] overflow-y-auto mb-4">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </div>
    );
  };

  useEffect(() => {
    const unsubscribeOnConnecting = room.addListener('connecting', () => {
      setConnectionState('connecting');
    });

    const unsubscribeOnConnected = room.addListener('connect', () => {
      setConnectionState('connected');
    });

    const unsubscribeOnDisconnected = room.addListener('disconnect', () => {
      setConnectionState('disconnected');
    });

    const unsubscribeOnMessageReceived = room.addListener('message', (message) => {
      setMessages((msgs) => [...msgs, message]);
    });

    room.connect()

    return () => {
      unsubscribeOnConnecting();
      unsubscribeOnConnected();
      unsubscribeOnDisconnected();
      unsubscribeOnMessageReceived();
    };
  }, [room]);

  useEffect(() => {
    console.log('Chat component rendered');
  }, []);

  return (
    <div className="container mx-auto px-4 bg-white rounded-xl shadow-lg">
      <div className="flex flex-col p-10">
        <h4>Connection State: {connectionState}</h4>
        <MessageList messages={messages} />
        <div className="flex flex-row w-full">
        <input
          type="text"
          className="w-full bg-gray-100 border border-gray-300 p-3 rounded-full focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:bg-white placeholder-gray-400"
          placeholder="Type your message here..."
          value={messageToSend}
          onChange={(e) => setMessageToSend(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onMessageSend();
            }
          }}
          />
          <SendButton disabled={isSendDisabled} onPress={onMessageSend} />
        </div>
      </div>
      <div className="flex items-center space-x-4"></div>
    </div>

  );
}

export default Chat;
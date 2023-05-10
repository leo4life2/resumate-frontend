import React, { useState, useEffect } from 'react';
import { ChatRoom } from 'amazon-ivs-chat-messaging';

const SendButton = ({ onPress, disabled }) => {
  return (
    <button
      disabled={disabled}
      onClick={onPress}
      className={`bg-blue-500 text-white font-semibold py-2 px-4 rounded ${disabled ? 'opacity-50' : 'hover:bg-blue-700'}`}
    >
      Send
    </button>
  );
};


const Chat = ({ room_id, chat_token, s_exp, t_exp }) => {
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

  const onMessageSend = () => {};
  const isSendDisabled = connectionState !== 'connected';

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

    room.connect()
    
    return () => {
      unsubscribeOnConnecting();
      unsubscribeOnConnected();
      unsubscribeOnDisconnected();
    };
  }, [room]);

  return (
    <div className="container mx-auto px-4">
      <h4 className="text-xl font-bold mb-4">Connection State: {connectionState}</h4>
      <div className="flex items-center space-x-4">
        <input
          type="text"
          className="w-full border border-gray-300 p-2 rounded-md focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          placeholder="Type your message here..."
        />
        <SendButton disabled={isSendDisabled} onPress={onMessageSend} />
      </div>
    </div>
  );
}

export default Chat;
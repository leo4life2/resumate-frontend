import React, { useState, useEffect } from 'react';
import { ChatRoom } from 'amazon-ivs-chat-messaging';

const SendButton = ({ onPress, disabled }) => {
  return (
    <button disabled={disabled} onClick={onPress}>
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
    <div>
      <h4>Connection State: {connectionState}</h4>
      <SendButton disabled={isSendDisabled} onPress={onMessageSend} />
    </div>
  );
}

export default Chat;
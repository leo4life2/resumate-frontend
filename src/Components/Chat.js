import React, { useState, useEffect } from 'react';
import { ChatRoom } from 'amazon-ivs-chat-messaging';

const Chat = ({ room_id, chat_token }) => {
  //AQICAHgm5DC1V25pBVEhXdu--DOMvHAxl47LlIVxHqc_j6xXLgE4OMZ3JxlxGToWx5LPJq9VAAABqDCCAaQGCSqGSIb3DQEHBqCCAZUwggGRAgEAMIIBigYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAzNEubd1XTS6VzezgcCARCAggFbDKqcaQtF_luiyKum5nbLpMc90PXoR2WnpUUYrzHgqXNHZXXbvTAN6nWApGXwlTVdLzOd6k5LCCUPumlqYkErV0Btd1pPw3AoId0E08kcv1bT1S4XOicWeye2FLgLgyP1pHGQz6qrmr40SJpDGiGcq9qXgN5H-82Zusf2dQP06qeQLf9g09xOFki3nmX-gZRCG9Ka3aCzq_OUpCaceS5bFjOJk66ePqUNDCQ62WKubucxXafG6OsA7jo5lUtfeF6y-PwH_mB9C43O1KRXtJ0CwnPpgEv1TieLP6dUxB5epHqneZiENq9bCh22KZ3nH-CMjFiFOWjBFpCXzWpa_kqlk-C21jmTq9NNFHd3LomQMNb5M0YvGu_prx_GSMzsgqV-AKJj2qMw2AxkcJ79Wv5XJWc59PTZ1vNL5NmK7dYMU8ws2g4v0huBXaLV65M3KLDx7sevDf1RbTxm-0Q!#0
  const [room] = useState(() =>
    new ChatRoom({
      regionOrUrl: 'us-east-1',
      tokenProvider: () => { return chat_token },
    }),
  );

  const [connectionState, setConnectionState] = useState('disconnected');

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

    return () => {
      unsubscribeOnConnecting();
      unsubscribeOnConnected();
      unsubscribeOnDisconnected();
    };
  }, [room]);

  return (
    <div>
      <h4>Connection State: {connectionState}</h4>
    </div>
  );
}

export default Chat;
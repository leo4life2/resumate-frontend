import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Amplify, Auth } from 'aws-amplify';
import { withAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import axios from 'axios';

import awsExports from '../aws-exports';
Amplify.configure(awsExports);

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const [response, setResponse] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      console.log((await Auth.currentSession()).getIdToken().getJwtToken())
    }
    getUser().then(() => {console.log(user)})
    
  })

  const handleTest = async () => {
    // set header to include jwt token
    const res = await axios.get('https://jrn8nltaqj.execute-api.us-east-1.amazonaws.com/frontend-test/chatroom/rooms', {
      headers: {
        Authorization: (await Auth.currentSession()).getIdToken().getJwtToken()
      }
    })
    console.log(res)
  }
  return (
    <div className="min-h-screen bg-white flex flex-col bg-gradient-to-r from-blue-500 via-purple-400 to-orange-500">
      <button className="bg-indigo-600 text-white text-3xl py-4 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300" onClick={() => handleTest()}>
        Test User Auth
      </button>
      <button className="bg-indigo-600 text-white text-3xl py-4 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300" onClick={() => signOut()}>
        Sign Out
      </button>
    </div>
  )
}

export default withAuthenticator(Dashboard)
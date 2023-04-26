import React, { useEffect } from 'react'
import { useNavigate } from 'react-router'

import { Amplify } from 'aws-amplify';

import { withAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import awsExports from '../aws-exports';
Amplify.configure(awsExports);

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  useEffect(() => {
    console.log(user)
  })
  return (
    <div className="min-h-screen bg-white flex flex-col bg-gradient-to-r from-blue-500 via-purple-400 to-orange-500">
      <h1 className="text-white text-center text-7xl font-semibold mb-6 mt-8">
        Welcome to Resumate {user.attributes.email}
      </h1>
    </div>
  )
}

export default withAuthenticator(Dashboard)
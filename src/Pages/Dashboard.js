import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Amplify, Auth } from 'aws-amplify';
import { withAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import axios from 'axios';
import logo from '../Assets/logo.png'

import awsExports from '../aws-exports';
Amplify.configure(awsExports);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('No file chosen');

  useEffect(() => {
    const getUser = async () => {
      console.log((await Auth.currentSession()).getIdToken().getJwtToken())
    }
    getUser().then(() => { console.log(user) })

  })

  const handleFileChange = (e) => {
    if (e.target.files[0] && e.target.files[0].type === 'application/pdf') {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    } else {
      setFile(null);
      setFileName('Invalid file format. Please select a PDF.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      console.log('Uploading:', file);
      alert('File uploaded successfully');
    } else {
      alert('Invalid file format. Please select a PDF.');
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    setFileName(file.name);
    handleFileChange({ target: { files: [file] } });
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col bg-gradient-to-b from-blue-400 via-purple-400 to-orange-400">
      <nav className="flex items-center justify-between p-4 bg-white shadow-md rounded-2xl mx-4 mt-4">
        <div className="flex items-center space-x-2 py-1 pl-1" onClick={() => navigate("/")}>
          <img className="w-12 h-12" src={logo} alt='logo'></img>
          <h1 className="text-indigo-500 text-xl font-semibold">Resumate</h1>
        </div>
        <span className="text-xl font-semibold text-gray-700">
          Welcome, {user.attributes.email}
        </span>
        <button
          className="bg-indigo-600 text-white py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
          onClick={() => {signOut(); navigate("/")}}
        >
          Logout
        </button>
      </nav>
      <div className="bg-white p-8 mt-8 mx-8 rounded-t-3xl shadow-lg grid grid-cols-3 flex-grow">
        <div>
          <h1 className="text-2xl font-bold mb-4">Resume Upload</h1>
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              className="w-full max-w-md border-2 border-dashed border-blue-500 py-8 px-6 6 text-center rounded-lg"
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="dropzone-input"
              />
              <label htmlFor="dropzone-input" className="cursor-pointer">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <p>Drag and drop your file here, or</p>
                    <p className="font-semibold text-blue-500">click to browse</p>
                  </div>
                </div>
              </label>
              <p className="mt-2 text-sm text-gray-600">{fileName}</p>
            </div>
            <button
              type="submit"
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Upload
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default withAuthenticator(Dashboard);

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
  const [matches, setMatches] = useState([]);
  const [disabledButtons, setDisabledButtons] = useState({});

  const sendInvitation = async (matchID) => {
    return;
  };

  const handleButtonClick = async (matchID) => {
    try {
      await sendInvitation(matchID);
      alert('Invitation sent successfully');
      setDisabledButtons((prevDisabledButtons) => ({
        ...prevDisabledButtons,
        [matchID]: true,
      }));
    } catch (error) {
      console.error('Failed to send invitation:', error);
      alert('Failed to send invitation');
    }
  };

  useEffect(() => {
    const getUser = async () => {
      console.log((await Auth.currentSession()).getIdToken().getJwtToken())
    }
    getUser().then(() => { console.log(user) })
  }, [user])

  const handleFileChange = (e) => {
    if (e.target.files[0] && e.target.files[0].type === 'application/pdf') {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    } else {
      setFile(null);
      setFileName('Invalid file format. Please select a PDF.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      try {
        const res = await axios.put("https://jrn8nltaqj.execute-api.us-east-1.amazonaws.com/prod/resumes", file, {
          headers: {
            Authorization: (await Auth.currentSession()).getIdToken().getJwtToken(),
            'Content-Type': 'application/pdf',
            filename: file.name,
          },
        })
        if (res.status !== 200) {
          alert('Error uploading file');
          console.log(res);
          return;
        } else {
          console.log(res);
          alert('File uploaded successfully');
          setFile(null);
          setFileName('No file chosen');
        }
      } catch (err) {
        alert('Error uploading file');
        console.log(err);
      }
    } else {
      alert('Invalid file format. Please select a PDF.');
    }
  };

  const handleGetMatches = async () => {
    try {
      const res = await axios.post("https://jrn8nltaqj.execute-api.us-east-1.amazonaws.com/prod/resumes/search", null, {
        headers: {
          Authorization: (await Auth.currentSession()).getIdToken().getJwtToken(),
        },
      })
      if (res.status !== 200) {
        alert('Error getting matches');
        console.log(res);
        return;
      } else {
        console.log(res);
        setMatches(res.data.data);
        alert('Matches retrieved successfully');
      }
    } catch (err) {
      alert('Error getting matches');
      console.log(err);
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
          onClick={() => { signOut(); navigate("/") }}
        >
          Logout
        </button>
      </nav>
      <div className="bg-white p-8 mt-8 mx-8 rounded-t-3xl shadow-lg grid grid-cols-3 flex-grow">
        <div>
          <h1 className="text-2xl font-bold mb-4">Resume Upload / Update</h1>
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
        <div className="col-span-2 ml-6">
          <h1 className="text-2xl font-bold mb-4">Getting Matches</h1>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={handleGetMatches}>
            Get Matches
          </button>
          <div>
            {matches.map((match) => (
              <div key={match.userID} className="mt-4 p-4 border rounded shadow flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-bold">{match.userID}</h1>
                  <p className="text-lg">Match Rate: {(match.score * 100).toFixed(2)} %</p>
                </div>
                <button
                  className={`px-4 py-2 rounded text-white ${disabledButtons[match.userID] ? 'bg-gray-500' : 'bg-blue-500'
                    }`}
                  disabled={disabledButtons[match.userID]}
                  onClick={() => handleButtonClick(match.userID)}
                >
                  {disabledButtons[match.userID] ? 'Already Invited' : 'Invite to Chat'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuthenticator(Dashboard);
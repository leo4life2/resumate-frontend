import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Amplify, Auth } from 'aws-amplify';
import { withAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import Chat from '../Components/Chat';
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
  const [chatrooms, setChatrooms] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [curChat, setCurChat] = useState('');

  const sendInvitation = async (matchID) => {
    return;
  };

  const handleCheckboxChange = (e, userID) => {
    if (e.target.checked) {
      setSelectedUsers([...selectedUsers, userID]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userID));
    }
  };

  const handleInviteButtonClick = async () => {
    console.log(selectedUsers);
  };

  useEffect(() => {
    const getUser = async () => {
      console.log((await Auth.currentSession()).getIdToken().getJwtToken())
    }
    getUser().then(() => { console.log(user) })
  }, [user])

  useEffect(() => {
    const getChatrooms = async () => {
      try {
        const res = await axios.get("https://jrn8nltaqj.execute-api.us-east-1.amazonaws.com/prod/chatroom/rooms", {
          headers: {
            Authorization: (await Auth.currentSession()).getIdToken().getJwtToken(),
          },
        })
        if (res.status !== 200) {
          console.log(res);
          return;
        } else {
          console.log(res);
          setChatrooms(res.data.data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    getChatrooms();
  }, [refresh]);

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
            filename: user.attributes.email + '.pdf',
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

  const createChatroom = async () => {
    try {
      const res = await axios.post("https://jrn8nltaqj.execute-api.us-east-1.amazonaws.com/prod/chatroom/create", null, {
        headers: {
          Authorization: (await Auth.currentSession()).getIdToken().getJwtToken(),
        },
      })
      if (res.status !== 200) {
        alert('Error creating chatroom');
        console.log(res);
        return;
      } else {
        console.log(res);
        alert('Chatroom created successfully');
        setRefresh(!refresh);
      }
    } catch (err) {
      alert('Error creating chatroom');
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
              Upload / Update
            </button>
          </form>

          <div className="mt-8">
            <h1 className="text-2xl font-bold mb-4">Your Chatrooms</h1>

            <div className="flex flex-col space-y-4">
              {chatrooms.map((chatroom) => (
                <div key={chatroom} className="p-4 border rounded shadow flex justify-between items-center cursor-pointer bg-blue-500 hover:shadow-lg hover:bg-blue-600">
                  <div>
                    <h3 className="text-lg font-bold text-white">Chatroom {chatroom.split("/")[1]}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {
          curChat === '' ?
            <div className="col-span-2 ml-6">
              <h1 className="text-2xl font-bold mb-4">Getting Matches</h1>
              {
                matches.length === 0 &&
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={handleGetMatches}
                >
                  Get Matches
                </button>
              }
              <div>
                {matches.map((match) => (
                  <div key={match.userID} className="mt-4 p-4 border rounded shadow flex justify-between items-center">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(match.userID)}
                        onChange={(e) => handleCheckboxChange(e, match.userID)}
                        className="mr-4"
                      />
                      <div>
                        <h1 className="text-xl font-bold">{match.userID}</h1>
                        <p className="text-lg">Match Rate: {(match.score * 100).toFixed(2)} %</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {
                selectedUsers.length > 0 &&
                <button
                  className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={handleInviteButtonClick}
                >
                  Invite to Chat
                </button>
              }
            </div>
            :
            <div className="col-span-2 ml-6">
              <div className="mt-8">
                <Chat room_id={"arn:aws:ivschat:us-east-1:670020256590:room/NWHYUr3g7k0p"} chat_token={
                  "AQICAHgm5DC1V25pBVEhXdu--DOMvHAxl47LlIVxHqc_j6xXLgHKpyRTQjoS7GVb03scBQwdAAABqDCCAaQGCSqGSIb3DQEHBqCCAZUwggGRAgEAMIIBigYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAyRIMhAedyxwPNmZyICARCAggFbYv1u6GUkItiolsj5Uek0zwR1i4c7WXHOcQiQp3BnAFxPFVItA8-ePp1abiKR-Bv8SFHd10AXrdcMQd5n-_avGee8uSxvtN2UB1_LjSqgpMCIh8yHI6PHHcEzDLV7gAZDWkdu-hOmz-mWtOffr4OhPvZbeGzcT9G1uhaIg-QMr5Q7HWq6nX4b5cNiP8LUv--RfOR1kB1Jy8KOIUiIvPm2vJO8FGE4w_lPjjfRjy1fHOJfiTr3UiyGaaS88fOgD2do625T-Vq995Zx1RGw1PMczFbN9goCLrAkZqv63APNleA67C8dzh8GYskXWwMiownu10L4obw_O14MCz6Q8atcfcKopKbU2_VQJtmAqCiPJdeHF61lGWMyZTQTVihQnHp5hRK50NepEUDiXhI8azylJ8twyrRGq5qfwc6xnx-_ID8Qv_fX7Z1xlrxUeFMj-q1n63SQSbkngcdkl5k!#0"} s_exp={"2023-04-29T17:37:44+00:00"} t_exp={"2023-04-29T17:37:44+00:00"} />
              </div>
            </div>
        }
      </div>
    </div>
  );
};

export default withAuthenticator(Dashboard);
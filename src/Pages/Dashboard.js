import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Amplify, Auth } from 'aws-amplify';
import { PDFDocument } from 'pdf-lib';
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
  const [inviteButtonDisabled, setInviteButtonDisabled] = useState(false);

  // Tokens
  const [room_id, setRoomID] = useState('');
  const [chat_token, setChatToken] = useState('');
  const [s_exp, setSExp] = useState('');
  const [t_exp, setTExp] = useState('');

  const handleCheckboxChange = (e, userID) => {
    if (e.target.checked) {
      setSelectedUsers([...selectedUsers, userID]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userID));
    }
  };

  const handleInviteButtonClick = async () => {
    setInviteButtonDisabled(true);
    // First Call LF8 to create a chatroom, and save ARN
    // LF8 response JSON's `message` field is the ARN
    let message; // Declare the variable outside the try block

    try {
      const res = await axios.post("https://jrn8nltaqj.execute-api.us-east-1.amazonaws.com/prod/chatroom/create", null, {
        headers: {
          Authorization: (await Auth.currentSession()).getIdToken().getJwtToken(),
        },
      });
    
      if (res.status !== 200) {
        alert('Error creating chatroom');
        console.log(res);
        return;
      } else {
        console.log(res);
        message = res.data.message; // Assign the value of the 'message' field
      }
    } catch (err) {
      alert('Error creating chatroom');
      console.log(err);
    }

    // Then Call LF5 to send invitations to selected users
    const requestBody = {
      chatroomARN: message, // Assuming 'message' is the chatroomARN from the previous API call
      userIds: selectedUsers, // Assuming 'selectedUsers' is the array of userIds
    };
    
    try {
      const res = await axios.post("https://jrn8nltaqj.execute-api.us-east-1.amazonaws.com/prod/chatroom/invite", requestBody, {
        headers: {
          Authorization: (await Auth.currentSession()).getIdToken().getJwtToken(),
          'Content-Type': 'application/json',
        },
      });
    
      if (res.status !== 200) {
        alert('Error inviting users to chatroom');
        console.log(res);
        return;
      } else {
        console.log(res);
        alert('Users invited successfully');
      }
    } catch (err) {
      alert('Error inviting users to chatroom');
      console.log(err);
    }
    setInviteButtonDisabled(false);
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
        // Read the input PDF file
        const inputPdfBytes = await file.arrayBuffer();
        const inputPdfDoc = await PDFDocument.load(inputPdfBytes);
  
        // Create a new PDF with only the first page
        const outputPdfDoc = await PDFDocument.create();
        const [firstPage] = await outputPdfDoc.copyPages(inputPdfDoc, [0]);
        outputPdfDoc.addPage(firstPage);
  
        // Serialize the output PDF
        const outputPdfBytes = await outputPdfDoc.save();
  
        // Convert the output PDF to a Blob object
        const trimmedFile = new Blob([outputPdfBytes], { type: 'application/pdf' });
  
        const res = await axios.put("https://jrn8nltaqj.execute-api.us-east-1.amazonaws.com/prod/resumes", trimmedFile, {
          headers: {
            Authorization: (await Auth.currentSession()).getIdToken().getJwtToken(),
            'Content-Type': 'application/pdf',
            filename: user.attributes.email + '.pdf',
          },
        });
  
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

  const handleGetTokens = async (roomID) => {
    try {
      const res = await axios.get("https://jrn8nltaqj.execute-api.us-east-1.amazonaws.com/prod/chatroom/" + roomID, {
        headers: {
          Authorization: (await Auth.currentSession()).getIdToken().getJwtToken(),
      }
      })
      if (res.status !== 200) {
        alert('Error getting tokens');
        console.log(res);
        return;
      } else {
        console.log(res);
        setChatToken(res.data.token);
        setSExp(res.data.s_exp);
        setTExp(res.data.t_exp);
        setCurChat(roomID);
      }
    } catch (err) {
      alert('Error getting tokens');
      console.log(err);
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
                <div key={chatroom} className="p-4 border rounded shadow flex justify-between items-center cursor-pointer bg-blue-500 hover:shadow-lg hover:bg-blue-600" onClick={() => handleGetTokens(chatroom.split("/")[1])}>
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
                  <div key={match.username} className="mt-4 p-4 border rounded shadow flex justify-between items-center">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(match.userID)}
                        onChange={(e) => handleCheckboxChange(e, match.userID)}
                        className="mr-4"
                      />
                      <div>
                        <a href={`https://cc-proj-resume-bucket.s3.amazonaws.com/${match.username}.pdf`} target="_blank" rel="noopener noreferrer">
                          <h1 className="text-xl font-bold underline text-blue-600">{match.username}</h1>
                        </a>
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
                  disabled={inviteButtonDisabled}
                >
                  Invite to Chat
                </button>
              }
            </div>
            :
            <div className="col-span-2 ml-6">
              <div className="mt-8">
                <Chat chat_token={chat_token} s_exp={s_exp} t_exp={t_exp} userID={user.username} userEmail={user.attributes.email}/>
              </div>
            </div>
        }
      </div>
    </div>
  );
};

export default withAuthenticator(Dashboard);
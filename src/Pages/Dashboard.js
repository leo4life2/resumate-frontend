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
  const [curChatName, setCurChatName] = useState('');
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
    navigate(0);
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

  const handleGetTokens = async (arn) => {
    const roomID = arn.split("/")[1];
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
        setCurChatName(chatrooms[arn])
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
        if (res.data.data.length === 0) {
          alert('Right now, there are no matches for you. Please check back later or wait for automatic grouping.');
        } else {
          alert('Matches retrieved successfully');
        }
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
        <div>
          <button
            className="bg-green-400 text-white py-2 px-4 rounded-full focus:outline-none mr-2 focus:ring-2 focus:ring-indigo-300"
            onClick={() => { navigate(0) }}
          >
            Reload
          </button>
          <button
            className="bg-indigo-600 text-white py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
            onClick={() => { signOut(); navigate("/") }}
          >
            Logout
          </button>
        </div>

      </nav>
      <div className="bg-zinc-200 p-8 mt-8 mx-8 rounded-t-3xl shadow-lg grid grid-cols-3 flex-grow">
        <div className='bg-white p-5 rounded-xl shadow-lg'>
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
          {
            curChat === '' ?
              <div className="mt-8">
                <h1 className="text-2xl font-bold mb-4">Your Chatrooms</h1>

                <div className="flex flex-col space-y-4">
                {Object.keys(chatrooms).map((arn) => (
                  <div
                    key={arn}
                    className="p-4 border rounded shadow flex justify-between items-center cursor-pointer bg-blue-500 hover:shadow-lg hover:bg-blue-600"
                    onClick={() => handleGetTokens(arn)}
                  >
                    <div>
                      <h3 className="text-lg font-bold text-white">Chatroom {chatrooms[arn]}</h3>
                    </div>
                  </div>
                ))}
                </div>
              </div>
              :
              <div className="bg-white mt-10 p-4 rounded-3xl shadow-lg flex-grow">
                <h1 className="text-2xl font-bold">You are now in chatroom {curChatName}</h1>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4" onClick={() => navigate(0)}> Go Back </button>
              </div>
          }
        </div>

        {
          curChat === '' ?
            <div className="col-span-2 ml-6 text-center bg-white rounded-lg p-5">
              <div className='mt-16'>
                <h1 className="text-6xl font-bold mb-4">Getting Matches</h1>
                {
                  matches.length === 0 &&
                  <button
                    className="mt-10 bg-blue-500 hover:bg-blue-700 text-white text-3xl font-bold py-6 px-8 rounded focus:outline-none focus:shadow-outline"
                    onClick={handleGetMatches}
                  >
                    Get Matches
                  </button>
                }
              </div>
              <div>
              {
                  inviteButtonDisabled ? (
                    <div className="flex justify-center items-center mt-10">
                      <div role="status">
                          <svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                          </svg>
                          <span class="sr-only">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    matches.map((match) => (
                      <div key={match.username} className="mt-4 p-4 border rounded shadow flex justify-between items-center">
                        <div className="flex items-start flex-row">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(match.userID)}
                            onChange={(e) => handleCheckboxChange(e, match.userID)}
                            className="mr-4 w-6 h-6"
                          />
                          <div className="text-left flex-grow">
                            <span className="text-2xl font-bold text-blue-600">{match.username}</span>
                            <p className="text-xl">Match Rate: {(match.score * 100).toFixed(2)} %</p>
                          </div>
                        </div>
                        <div className="ml-auto">
                          <a href={`https://cc-proj-resume-bucket.s3.amazonaws.com/${match.username}.pdf`} target="_blank" rel="noopener noreferrer">
                            <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"> View Resume </button>
                          </a>
                        </div>
                      </div>
                    ))
                  )
                }
                {
                  matches.length === 0 &&
                  <div className="mt-10 flex justify-center items-center">
                    <img src='https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?cs=srgb&dl=pexels-fauxels-3184416.jpg&fm=jpg' alt='no matches' className='h-[450px] rounded-lg' />
                  </div>
                }
              </div>

              {
                selectedUsers.length > 0 &&
                <button
                  className="mt-4 text-2xl bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded focus:outline-none focus:shadow-outline"
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
                <Chat room_id={curChat} chat_token={chat_token} s_exp={s_exp} t_exp={t_exp} userID={user.username} userEmail={user.attributes.email} />
              </div>
            </div>
        }
      </div>
    </div>
  );
};

export default withAuthenticator(Dashboard);
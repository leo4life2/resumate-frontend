import React from 'react'
import logo from '../Assets/logo.png'
import { useNavigate } from 'react-router'

const Landing = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2" onClick={() => navigate("/")}>
          <img className="w-16 h-16" src={logo} alt='logo'></img>
          <h1 className="text-indigo-500 text-5xl font-semibold">Resumate</h1>
        </div>
        <button className="bg-indigo-600 text-white text-3xl py-4 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300" onClick={() => navigate("/login")}>
              Login
        </button>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="rounded-lg p-12 shadow-lg bg-gradient-to-r from-blue-500 via-purple-400 to-orange-500 h-[600px]">
          <h2 className="text-white text-center text-7xl font-semibold mb-6 mt-8">
            Ready To Discover Your <br></br> Next Career Opportunity
          </h2>
          <h3 className="text-white text-center text-3xl font-medium mb-12 mt-10">
            A smarter way to connect job seekers and recruiters<br></br> through AI-driven resume analysis
          </h3>
          <div className="flex justify-center">
            <button className="bg-indigo-600 text-white text-3xl py-4 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300" onClick={() => navigate("/register")}>
              Sign up now
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Landing
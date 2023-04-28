import React from 'react'
import logo from '../Assets/logo.png'
import { useNavigate } from 'react-router'

const Landing = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-between p-4">
      <div className="flex items-center space-x-2 py-1 pl-1" onClick={() => navigate("/")}>
          <img className="w-12 h-12" src={logo} alt='logo'></img>
          <h1 className="text-indigo-500 text-xl font-semibold">Resumate</h1>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="rounded-lg p-12 shadow-lg bg-gradient-to-r from-blue-500 via-purple-400 to-orange-500 h-[600px] w-2/3">
          <h2 className="text-white text-center text-6xl font-semibold mb-6 mt-8">
            Ready To Discover Your <br></br> Next Career Opportunity
          </h2>
          <h3 className="text-white text-center text-2xl font-medium mb-12 mt-24">
            A smarter way to connect job seekers and recruiters<br></br> through AI-driven resume analysis
          </h3>
          <div className="flex justify-center mt-20">
            <button className="bg-indigo-600 text-white text-xl py-4 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300" onClick={() => navigate("/dashboard")}>
              Login / Sign Up
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Landing
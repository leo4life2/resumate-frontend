import React from 'react'
import logo from '../Assets/logo.png'
import { useNavigate } from 'react-router'

const Login = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-white flex flex-col bg-gradient-to-r from-blue-500 via-purple-400 to-orange-500">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2 bg-white rounded-full py-1 pl-1 pr-6 shadow-lg" onClick={() => navigate("/")}>
          <img className="w-16 h-16" src={logo} alt='logo'></img>
          <h1 className="text-indigo-500 text-5xl font-semibold">Resumate</h1>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="rounded-lg px-12 shadow-lg bg-gray-200 flex flex-col items-center w-1/2 justify-center space-y-4">
          <h2 className="text-6xl font-semibold mb-36 -mt-36 text-white">Login</h2>
          <form className="w-full space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                className="w-full px-3 py-2 border text-3xl border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                className="w-full px-3 py-2 border text-3xl border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div className="flex justify-center">
              <button
                type='submit'
                className="bg-indigo-600 text-white text-3xl py-4 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 mb-12 mt-8">
                Login
              </button>
            </div>
          </form>
        </div>

      </main>
    </div>
  )
}

export default Login
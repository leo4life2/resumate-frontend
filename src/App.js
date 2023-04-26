import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Landing from './Pages/Landing'
import Dashboard from './Pages/Dashboard'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  )
}

export default App
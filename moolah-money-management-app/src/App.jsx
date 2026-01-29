import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Dashboard from './pages/Dashboard.jsx'
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <Routes>
      {/* todo: add view based on logged in status */}
       <Route path="/" element={<Dashboard />} />
     </Routes>
    </>
  )
}

export default App

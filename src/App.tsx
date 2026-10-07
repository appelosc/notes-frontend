import { HashRouter, Routes, Route } from 'react-router'
import Login from './pages/Login'
import Boards from './pages/Boards'
import Notes from './pages/Notes'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/boards" element={<Boards />} />
        <Route path="/boards/:boardId" element={<Notes />} />
      </Routes>
    </HashRouter>
  )
}

export default App

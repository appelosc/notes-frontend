import { BrowserRouter, Routes, Route } from 'react-router'
import Login from './pages/Login'
import Boards from './pages/Boards'
import Notes from './pages/Notes'

// Decides which page to show based on the URL.
// "/" shows the login page, "/boards" shows the boards page,
// "/boards/42" shows the notes for board 42 (":boardId" is a placeholder).
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/boards" element={<Boards />} />
        <Route path="/boards/:boardId" element={<Notes />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

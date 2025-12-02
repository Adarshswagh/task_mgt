import {BrowserRouter,Routes, Route ,Router} from 'react-router-dom';
import { useState } from 'react'
import Login from './component/login.jsx'
import SignUp from './component/signup.jsx'
import ForgotPassword from './component/forgotpassword.jsx'
import Dashboard from './component/dashboard/Dashboard.jsx'
import Board from './component/task/board.jsx'
import List from './component/task/list.jsx'
import Calendar from './component/task/calendar.jsx'
import Files from './component/task/files.jsx'
import ProfilePage from './component/profile/page.jsx'

function App() {
  const [currentPage, setCurrentPage] = useState('login')

  return (
    // <>
    //   {currentPage === 'login' && (
    //     <Login 
    //       onNavigateToSignUp={() => setCurrentPage('signup')}
    //       onNavigateToForgotPassword={() => setCurrentPage('forgotpassword')}
    //     />
    //   )}
    //   {currentPage === 'signup' && (
    //     <SignUp onBackToLogin={() => setCurrentPage('login')} />
    //   )}
    //   {currentPage === 'forgotpassword' && ( 
    //     <ForgotPassword onBackToLogin={() => setCurrentPage('login')} />
    //   )}
    // </>
<>
<BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/board" element={<Board />} />
        <Route path="/list" element={<List />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/files" element={<Files />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App

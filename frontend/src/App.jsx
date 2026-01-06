import {BrowserRouter,Routes, Route ,Router} from 'react-router-dom';
import Login from './component/login.jsx'
import SignUp from './component/signup.jsx'
import ForgotPassword from './component/forgotpassword.jsx'
import Dashboard from './component/dashboard/Dashboard.jsx'
import Board from './component/task/board.jsx'
import List from './component/task/list.jsx'
import Calendar from './component/task/calendar.jsx'
import Files from './component/task/files.jsx'
import ProfilePage from './component/profile/page.jsx'
import ProtectedRoute from './component/ProtectedRoute.jsx'
import PublicRoute from './component/PublicRoute.jsx'
import EmployeeList from './component/employee/EmployeeList.jsx'
import CreateEmployee from './component/employee/CreateEmployee.jsx'
import EditEmployee from './component/employee/EditEmployee.jsx'
import Projects from './component/project/Projects.jsx'
import ProjectsBoard from './component/project/ProjectsBoard.jsx'
import ProjectsCalendar from './component/project/ProjectsCalendar.jsx'
import ProjectsFiles from './component/project/ProjectsFiles.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - redirect to dashboard if already logged in */}
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/forgotpassword" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        
        {/* Protected routes - redirect to login if not authenticated */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/board" element={<ProtectedRoute><Board /></ProtectedRoute>} />
        <Route path="/list" element={<ProtectedRoute><List /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/files" element={<ProtectedRoute><Files /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        
        {/* Employee routes - admin only (checked in components) */}
        <Route path="/employees" element={<ProtectedRoute><EmployeeList /></ProtectedRoute>} />
        <Route path="/employees/create" element={<ProtectedRoute><CreateEmployee /></ProtectedRoute>} />
        <Route path="/employees/edit/:id" element={<ProtectedRoute><EditEmployee /></ProtectedRoute>} />
        
        {/* Project Management routes */}
        <Route path="/dashboard/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/dashboard/projects/list" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/dashboard/projects/board" element={<ProtectedRoute><ProjectsBoard /></ProtectedRoute>} />
        <Route path="/dashboard/projects/calendar" element={<ProtectedRoute><ProjectsCalendar /></ProtectedRoute>} />
        <Route path="/dashboard/projects/files" element={<ProtectedRoute><ProjectsFiles /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

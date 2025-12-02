import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import backgroundImage from '../assets/background.png'
import logoImage from '../assets/logo.png'
import { login } from '../services/api'

function Login({ onNavigateToSignUp, onNavigateToForgotPassword }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    
    // Reset error
    setError('');
    
    // Validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const response = await login(email, password, rememberMe);
      
      if (response.status === 'success') {
        // Authentication cookie is set automatically by the server
        // No need to store in localStorage - cookies handle authentication
        
        // Navigate to dashboard on success
        navigate('/dashboard');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div 
      className="min-h-screen w-full relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'bottom',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Thin blue bar at the top */}
      <div className="w-full h-1 bg-blue-600"></div>
      
      {/* Header */}
      <header className="bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Left side - Logo and Company Name */}
          <div className="flex items-center gap-3">
            <img 
              src={logoImage} 
              alt="Kraftelite Logo" 
              className="h-10 w-auto"
            />
          </div>
          
          {/* Right side - Links */}
          <div className="flex items-center gap-6">
            <a 
              href="#" 
              className="text-gray-800 font-sans text-sm hover:text-blue-600 transition-colors"
            >
              Visit Kraftelite Website
            </a>
            <a 
              href="#" 
              className="text-gray-800 font-sans text-sm hover:text-blue-600 transition-colors"
            >
              Need Help to Login
            </a>
          </div>
        </div>
      </header>
      
      {/* Main content area - Login Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8 relative z-10">
        <div className="bg-white rounded-[30px] shadow-2xl border w-full max-w-md p-2">
          {/* Title */}
          <h1 className="text-3xl text-[#121212] mb-2 text-center mt-5">
            Login to Continue
          </h1>
          
          {/* Subtitle */}
          <p className="text-gray-600 mb-8 text-base text-center">
            Please login to add design tasks
          </p>
          <div className="bg-[#F7F7F7] rounded-[20px] p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* Email Input */}
              <div className="mb-6">
                  <label className="block text-gray-900 text-sm font-medium mb-2">
                  Email Id
                  </label>
                  <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="example@gmail.com"
                  required
                  disabled={loading}
                  />
              </div>
              
              {/* Password Input */}
              <div className="mb-6">
                  <label className="block text-gray-900 text-sm font-medium mb-2">
                  Password
                  </label>
                  <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  />
              </div>
              
              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between mb-6">
                  <label className="flex items-center cursor-pointer">
                  <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      disabled={loading}
                  />
                  <span className="text-gray-900 text-sm">Remember for 30 days</span>
                  </label>
                  <button 
                  type="button"
                  onClick={() => navigate('/forgotpassword')}
                  className="text-gray-900 text-sm hover:text-blue-600 transition-colors font-medium"
                  disabled={loading}
                  >
                  Forgot password
                  </button>
              </div>
              
              {/* Login Button with Gradient */}
              <button 
                  type="submit"
                  className="w-full text-white font-bold py-3 rounded-full mb-6 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                  background: 'linear-gradient(to top, #588AFF, #2667FF)'
                  }}
                  disabled={loading}
              >
                  {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            
            {/* Sign Up Link */}
            <div className="text-center">
                <span className="text-gray-600 text-sm">
                Don't have an account?{' '}
                </span>
                <button
                  onClick={() => navigate('/signup')}
                  className="text-gray-900 text-sm font-bold hover:text-blue-600 transition-colors"
                >
                  Sign up
                </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login


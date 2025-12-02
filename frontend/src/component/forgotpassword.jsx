import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import backgroundImage from '../assets/background.png'
import logoImage from '../assets/logo.png'

function ForgotPassword({ onBackToLogin }) {
  const [step, setStep] = useState(1)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate();

  // Password validation
  const hasMinLength = password.length >= 8
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const hasNumber = /\d/.test(password)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const handleResetPassword = () => {
    if (hasMinLength && hasSpecialChar && hasNumber && passwordsMatch) {
      setStep(2)
    }
  }

  const handleLogin = () => {
    onBackToLogin()
  }


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
      
      {/* Main content area */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8 relative z-10">
        <div className="bg-white rounded-[30px] shadow-2xl border w-full max-w-md p-2">
          {step === 1 && (
            <>
              {/* Title */}
              <h1 className="text-3xl text-[#121212] mb-2 text-center mt-5 font-bold">
                Forget Password
              </h1>
              
              {/* Subtitle */}
              <p className="text-gray-600 mb-4 text-base text-center">
                We have send a link & code to register email
              </p>
              
              {/* Progress Indicator - 2 steps */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-8 h-1 bg-blue-600 rounded"></div>
                <div className="w-8 h-1 bg-gray-300 rounded"></div>
              </div>
              
              <div className="bg-[#F7F7F7] rounded-[20px] p-6">
                {/* Password Input */}
                <div className="mb-6">
                  <label className="block text-gray-900 text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                </div>
                
                {/* Confirm Password Input */}
                <div className="mb-6">
                  <label className="block text-gray-900 text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Password Requirements */}
                <div className="mb-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className={`w-5 h-5 ${hasMinLength ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className={`text-sm ${hasMinLength ? 'text-green-600' : 'text-gray-600'}`}>
                      Must be at least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className={`w-5 h-5 ${hasSpecialChar ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className={`text-sm ${hasSpecialChar ? 'text-green-600' : 'text-gray-600'}`}>
                      Must contain one special character
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className={`w-5 h-5 ${hasNumber ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className={`text-sm ${hasNumber ? 'text-green-600' : 'text-gray-600'}`}>
                      Must contain one number
                    </span>
                  </div>
                </div>
                
                {/* Reset Password Button */}
                <button 
                  onClick={handleResetPassword}
                  disabled={!hasMinLength || !hasSpecialChar || !hasNumber || !passwordsMatch}
                  className="w-full text-white font-bold py-3 rounded-full mb-4 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(to top, #588AFF, #2667FF)'
                  }}
                >
                  Reset Password
                </button>
                
                {/* Go Back Link */}
                <button
                  onClick={() => navigate('/')}
                  className="w-full text-center text-gray-600 text-sm hover:text-blue-600 transition-colors"
                >
                  &lt; Go Back
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="p-8">
              {/* Success Title */}
              <h1 className="text-3xl text-[#121212] mb-2 text-center font-bold">
                Successfully Created
              </h1>
              
              {/* Success Subtitle */}
              <p className="text-gray-600 mb-4 text-base text-center">
                Password has been successfully updated
              </p>
              
              {/* Decorative Lines */}
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="w-12 h-1 bg-blue-400 rounded"></div>
                <div className="w-12 h-1 bg-blue-400 rounded"></div>
              </div>
              
              {/* Empty Space */}
              <div className="h-32 mb-6"></div>
              
              {/* Instruction Text */}
              <p className="text-gray-500 text-sm text-center mb-6">
                Please login to account to continue...
              </p>
              
              {/* Login Button */}
              <button 
                onClick={() => navigate('/')}
                className="w-full text-white font-bold py-3 rounded-full mb-4 shadow-md hover:shadow-lg transition-all"
                style={{
                  background: 'linear-gradient(to top, #588AFF, #2667FF)'
                }}
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword




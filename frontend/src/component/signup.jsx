import { useState, useRef } from 'react'
import { useNavigate } from "react-router-dom";
import backgroundImage from '../assets/background.png'
import logoImage from '../assets/logo.png'
import { register } from '../services/api'

function SignUp({ onBackToLogin }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    profileImage: null,
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client',
    verificationCode: ['', '', '', '', '', '']
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const codeInputRefs = useRef([])
  const navigate = useNavigate();

  // Password validation
  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    hasNumber: /\d/.test(formData.password)
  }

  const allRequirementsMet = Object.values(passwordRequirements).every(req => req === true)

  // Handle file upload
  const handleFileSelect = (file) => {
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      setFormData({ ...formData, profileImage: file })
    } else {
      alert('Image size must be less than 10MB')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file)
    }
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Handle verification code input
  const handleCodeChange = (index, value) => {
    if (value.length > 1) return // Only allow single digit
    
    const newCode = [...formData.verificationCode]
    newCode[index] = value.replace(/\D/g, '') // Only numbers
    setFormData({ ...formData, verificationCode: newCode })

    // Auto-focus next input
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus()
    }
  }

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !formData.verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = [...formData.verificationCode]
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newCode[i] = char
    })
    setFormData({ ...formData, verificationCode: newCode })
    const nextIndex = Math.min(pastedData.length, 5)
    codeInputRefs.current[nextIndex]?.focus()
  }

  // Step navigation
  const handleNext = async () => {
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.role) {
        setError('Please fill in all fields')
        return
      }
      setError('')
      setStep(2)
    } else if (step === 2) {
      if (!formData.password || !formData.confirmPassword) {
        setError('Please fill in password fields')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }
      if (!allRequirementsMet) {
        setError('Please meet all password requirements')
        return
      }
      setError('')
      setStep(3)
    } else if (step === 3) {
      const code = formData.verificationCode.join('')
      if (code.length !== 6) {
        setError('Please enter the complete verification code')
        return
      }
      
      // Register user
      setError('')
      setLoading(true)
      
      try {
        const response = await register(
          formData.fullName,
          formData.email,
          formData.password,
          formData.role,
          formData.profileImage
        )
        
        if (response.status === 'success') {
          // Registration successful - user should log in to get authentication cookie
          // No need to store in localStorage - cookies handle authentication
          setStep(4)
        } else {
          setError(response.message || 'Registration failed')
        }
      } catch (err) {
        setError(err.message || 'An error occurred during registration. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleGoBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleViewDashboard = () => {
    // Navigate to dashboard or handle success
    navigate('/dashboard')
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
          <div className="flex items-center gap-3">
            <img 
              src={logoImage} 
              alt="Kraftelite Logo" 
              className="h-10 w-auto"
            />
          </div>
          
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
      
      {/* Main content area - Sign Up Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8 relative z-10">
        <div className="bg-white rounded-[30px] shadow-2xl border w-full max-w-md p-2">
          {/* Title */}
          <h1 className="text-3xl text-[#121212] mb-2 text-center mt-5">
            Create a Account
          </h1>
          
          {/* Subtitle */}
          <p className="text-gray-600 mb-4 text-base text-center">
            Please signup to add design tasks
          </p>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`h-1.5 rounded-full transition-all ${
                  stepNum < step
                    ? 'bg-blue-500 w-8'
                    : stepNum === step
                    ? step === 3
                      ? 'bg-blue-600 w-8'
                      : 'bg-blue-500 w-8'
                    : 'bg-gray-300 w-8'
                }`}
              />
            ))}
          </div>

          <div className="bg-[#F7F7F7] rounded-[20px] p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Profile Image, Full Name, Email */}
            {step === 1 && (
              <>
                {/* Profile Image Upload */}
                <div className="mb-6">
                  <label className="block text-gray-900 text-sm font-medium mb-2">
                    Add Profile Image
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-white'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formData.profileImage ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={URL.createObjectURL(formData.profileImage)}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover mb-2"
                        />
                        <p className="text-sm text-gray-600">{formData.profileImage.name}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setFormData({ ...formData, profileImage: null })
                          }}
                          className="text-sm text-red-600 mt-2"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="text-4xl text-gray-400 mb-2">+</div>
                        <p className="text-gray-600 text-sm mb-1">
                          Drag or Drop image into box
                        </p>
                        <p className="text-gray-500 text-xs">
                          Max image size is 10MB
                        </p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div className="mb-6">
                  <label className="block text-gray-900 text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Atharv Kelwadkar"
                  />
                </div>

                {/* Email */}
                <div className="mb-6">
                  <label className="block text-gray-900 text-sm font-medium mb-2">
                    Email Id
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="example@gmail.com"
                  />
                </div>

                {/* Role */}
                <div className="mb-6">
                  <label className="block text-gray-900 text-sm font-medium mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="admin">Admin</option>
                    <option value="employee">Employee</option>
                    <option value="client">Client</option>
                  </select>
                </div>
              </>
            )}

            {/* Step 2: Password */}
            {step === 2 && (
              <>
                {/* Password */}
                <div className="mb-6">
                  <label className="block text-gray-900 text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="Qwu@871^%1!!!12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
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

                {/* Confirm Password */}
                <div className="mb-6">
                  <label className="block text-gray-900 text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="Qwu@871^%1!!!12"
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
                  <div className="flex items-center text-sm">
                    <span className={`mr-2 ${passwordRequirements.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                      ✓
                    </span>
                    <span className={passwordRequirements.minLength ? 'text-gray-900' : 'text-gray-500'}>
                      Must be at least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className={`mr-2 ${passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
                      ✓
                    </span>
                    <span className={passwordRequirements.hasSpecialChar ? 'text-gray-900' : 'text-gray-500'}>
                      Must contain one special character
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className={`mr-2 ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                      ✓
                    </span>
                    <span className={passwordRequirements.hasNumber ? 'text-gray-900' : 'text-gray-500'}>
                      Must contain one number
                    </span>
                  </div>
                </div>

                {/* Go Back Link */}
                <div className="mb-4">
                  <button
                    onClick={handleGoBack}
                    className="text-gray-600 text-sm hover:text-blue-600 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Go Back
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Verification Code */}
            {step === 3 && (
              <>
                <div className="mb-6">
                  <label className="block text-gray-900 text-sm font-medium mb-2">
                    Verify Code
                  </label>
                  <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                    {formData.verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (codeInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(index, e)}
                        className="w-12 h-12 text-center text-lg border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ))}
                  </div>
                </div>

                {/* Go Back Link */}
                <div className="mb-4">
                  <button
                    onClick={handleGoBack}
                    className="text-gray-600 text-sm hover:text-blue-600 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Go Back
                  </button>
                </div>
              </>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <>
                <div className="mb-6 min-h-[200px] flex flex-col justify-center">
                  <div className="bg-gray-100 rounded-lg h-48 mb-4 flex items-center justify-center">
                    {/* Empty space as shown in screenshot */}
                  </div>
                  <p className="text-gray-900 text-base font-medium text-left">
                    Account has been successfully created
                  </p>
                </div>
              </>
            )}

            {/* Action Buttons */}
            {step < 4 && (
              <button 
                onClick={handleNext}
                disabled={loading}
                className="w-full text-white font-bold py-3 rounded-full mb-4 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(to top, #588AFF, #2667FF)'
                }}
              >
                {loading ? 'Creating Account...' : step === 3 ? 'Verify Account' : 'Next'}
              </button>
            )}

            {step === 4 && (
              <button 
                onClick={handleViewDashboard}
                className="w-full text-white font-bold py-3 rounded-full mb-4 shadow-md hover:shadow-lg transition-all uppercase"
                style={{
                  background: 'linear-gradient(to top, #588AFF, #2667FF)'
                }}
              >
                View Dashboard
              </button>
            )}

            {/* Footer Link */}
            <div className="text-center">
              <span className="text-gray-600 text-sm">
                Don't have an account?{' '}
              </span>
              <button
                onClick={() => navigate('/')}
                className="text-gray-900 text-sm font-bold hover:text-blue-600 transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp


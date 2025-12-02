import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../assets/logo.png';
import { getCurrentUser, getBaseUrl, logout } from '../services/api';

function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Fetch user from API - authentication handled by HTTP-only cookies
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        if (response.status === 'success' && response.user) {
          setUser(response.user);
        } else {
          // If not authenticated, user will be redirected by route guards
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  // Get user initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const userName = user?.name || 'User';
  const userEmail = user?.email || '';
  const userAvatar = user?.avatar;
  const initials = getInitials(userName);

  // Get avatar URL - handle both relative and absolute URLs
  const getAvatarUrl = () => {
    if (!userAvatar) return null;
    // If it's already a full URL, return it as is
    if (userAvatar.startsWith('http://') || userAvatar.startsWith('https://')) {
      return userAvatar;
    }
    // If it's a relative URL, prepend the backend URL
    const baseUrl = getBaseUrl();
    // Ensure the avatar path starts with /
    const avatarPath = userAvatar.startsWith('/') ? userAvatar : '/' + userAvatar;
    const fullUrl = baseUrl + avatarPath;
    return fullUrl;
  };

  const avatarUrl = getAvatarUrl();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Server clears the authentication cookie
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      // Still navigate to login even if API call fails
      setUser(null);
      navigate('/');
    }
  };

  // Handle profile navigation
  const handleProfileClick = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  return (
    <header className="bg-gray-100 sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        {/* Left side - Logo and Company Name */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <img 
            src={logoImage} 
            alt="Kraftelite Logo" 
            className="h-10 w-auto"
          />

        </div>
        
        {/* Center - Search Bar and Share Button */}
        <div className="flex-1 max-w-md mx-4 flex items-center gap-2" >
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-12 pr-4 py-3 bg-white rounded-full border border-gray-200 border-r-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>
          {/* Share Button */}
          <button className="h-[46px] w-12 rounded-full bg-white border border-gray-200 border-l-0 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0 -ml-px">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
        
        {/* Right side - Actions and User menu */}
        <div className="flex items-center gap-1 flex-shrink-0">

          
          {/* Notifications */}
          <button className="relative h-[46px] w-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          
          {/* User Profile */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-1 py-1 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                {avatarUrl ? (
                  <>
                    <img 
                      src={avatarUrl} 
                      alt={userName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        // Hide image and show initials if image fails to load
                        e.target.style.display = 'none';
                        const fallback = e.target.parentElement.querySelector('.avatar-fallback');
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="avatar-fallback h-full w-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center absolute inset-0"
                      style={{ display: 'none' }}
                    >
                      <span className="text-white font-semibold text-sm">{initials}</span>
                    </div>
                  </>
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{initials}</span>
                  </div>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">{userName}</p>
                <p className="text-xs text-gray-500 leading-tight">{userEmail}</p>
              </div>
              <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={handleProfileClick}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;


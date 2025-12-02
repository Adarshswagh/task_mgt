import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import DashboardLayout from '../dashboard/DashboardLayout';
import { getCurrentUser, getBaseUrl, updateProfile } from '../../services/api';

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('personal-info');
  const [savingPersonalInfo, setSavingPersonalInfo] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Personal Info form state
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileInputRef = useRef(null);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      // Fetch user from API - authentication handled by HTTP-only cookies
      try {
        const response = await getCurrentUser();
        if (response.status === 'success' && response.user) {
          setUser(response.user);
          setPersonalInfo({
            name: response.user.name || '',
            email: response.user.email || '',
          });
        } else {
          // If not authenticated, redirect to login
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        // If unauthorized, redirect to login
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    setActiveSection('personal-info');

    // Cleanup preview URL on unmount
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
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

  // Get avatar URL - handle both relative and absolute URLs
  const getAvatarUrl = () => {
    // If there's a preview (newly selected/cropped image), show that first
    if (avatarPreview) {
      return avatarPreview;
    }
    
    // Otherwise, show the user's saved avatar
    if (!user?.avatar) return null;
    
    // If it's already a full URL (http:// or https://), return it as is
    if (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) {
      return user.avatar;
    }
    
    // If it starts with /storage, it's a relative path that needs the base URL
    // If it's a relative URL, prepend the backend URL
    const baseUrl = getBaseUrl();
    // Ensure the avatar path starts with /
    const avatarPath = user.avatar.startsWith('/') ? user.avatar : '/' + user.avatar;
    const fullUrl = baseUrl + avatarPath;
    return fullUrl;
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Compress image if it's too large
  const compressImage = (file, maxSizeMB = 2, quality = 0.9) => {
    return new Promise((resolve, reject) => {
      const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
      
      // If file is already small enough, return as is
      if (file.size <= maxSize) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Calculate new dimensions to reduce file size
          let width = img.width;
          let height = img.height;
          let currentQuality = quality;

          // If image is very large, reduce dimensions first
          const maxDimension = 2000; // Max width or height
          if (width > maxDimension || height > maxDimension) {
            const ratio = Math.min(maxDimension / width, maxDimension / height);
            width = width * ratio;
            height = height * ratio;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Try to compress to target size
          const compress = (q) => {
            return new Promise((res) => {
              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    res(null);
                    return;
                  }
                  
                  // If still too large and quality can be reduced, try again
                  if (blob.size > maxSize && q > 0.3) {
                    compress(q - 0.1).then(res);
                  } else {
                    const compressedFile = new File([blob], file.name, {
                      type: 'image/jpeg',
                      lastModified: Date.now(),
                    });
                    res(compressedFile);
                  }
                },
                'image/jpeg',
                q
              );
            });
          };

          compress(currentQuality).then(resolve).catch(reject);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Clear previous errors/success messages
    setError('');
    setSuccess('');

    // Check if it's an image first
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      setTimeout(() => setError(''), 3000);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Show loading state
    const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    
    try {
      // Revoke previous preview URL if it exists
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }

      // Compress image if needed
      let processedFile = file;
      if (file.size > 2 * 1024 * 1024) {
        setSuccess(`Compressing image (${originalSizeMB}MB)...`);
        processedFile = await compressImage(file, 2, 0.85);
        const newSizeMB = (processedFile.size / (1024 * 1024)).toFixed(2);
        setSuccess(`Image compressed from ${originalSizeMB}MB to ${newSizeMB}MB`);
        setTimeout(() => setSuccess(''), 3000);
      }

      // Show immediate preview - set file and preview right away
      const previewUrl = URL.createObjectURL(processedFile);
      setAvatarPreview(previewUrl);
      setAvatarFile(processedFile); // Set file immediately so preview shows

      // Create image URL for cropping
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImage(reader.result);
        setShowCropModal(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
      };
      reader.onerror = () => {
        setError('Failed to load image. Please try again.');
        setTimeout(() => setError(''), 3000);
        // Revoke preview URL on error
        if (avatarPreview && avatarPreview.startsWith('blob:')) {
          URL.revokeObjectURL(avatarPreview);
          setAvatarPreview(null);
        }
        setAvatarFile(null); // Clear file on error
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Failed to process image. Please try a different image.');
      setTimeout(() => setError(''), 5000);
      // Revoke preview URL on error
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getRadianAngle = (degreeValue) => {
    return (degreeValue * Math.PI) / 180;
  };

  const rotateSize = (width, height, rotation) => {
    const rotRad = getRadianAngle(rotation);
    return {
      width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
  };

  const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    const rotRad = getRadianAngle(rotation);

    // Calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
      image.width,
      image.height,
      rotation
    );

    // Set canvas size to match the bounding box
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // Translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(1, 1);
    ctx.translate(-image.width / 2, -image.height / 2);

    // Draw rotated image
    ctx.drawImage(image, 0, 0);

    const data = ctx.getImageData(
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height
    );

    // Set canvas width to final desired crop size - this will clear existing canvas
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Paste generated rotate image at the top left corner
    ctx.putImageData(
      data,
      0,
      0
    );

    // As a blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  const handleCropComplete = async () => {
    if (!cropImage || !croppedAreaPixels) {
      setError('Please adjust the crop area');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const croppedImageBlob = await getCroppedImg(
        cropImage,
        croppedAreaPixels,
        rotation
      );

      if (croppedImageBlob) {
        // Revoke old preview URL if it exists
        if (avatarPreview && avatarPreview.startsWith('blob:')) {
          URL.revokeObjectURL(avatarPreview);
        }

        // Create a File from the blob
        const croppedFile = new File([croppedImageBlob], 'avatar.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        setAvatarFile(croppedFile);
        
        // Create preview with cropped image
        const previewUrl = URL.createObjectURL(croppedImageBlob);
        setAvatarPreview(previewUrl);
        
        // Close modal and reset crop state
        setShowCropModal(false);
        setCropImage(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setCroppedAreaPixels(null);
        
        setSuccess('Image cropped successfully. Click "Save Changes" to update your profile.');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      setError('Failed to process image. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCancelCrop = () => {
    // Revoke preview URL if it was created from file selection
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
    
    setShowCropModal(false);
    setCropImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setAvatarFile(null);
    
    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSavePersonalInfo = async () => {
    setError('');
    setSuccess('');
    setSavingPersonalInfo(true);

    try {
      const response = await updateProfile(
        personalInfo.name,
        personalInfo.email,
        null, // Don't update password here
        avatarFile
      );

      if (response.status === 'success') {
        // Update user state with new data
        setUser(response.user);
        
        // If avatar was uploaded, clear the file and preview
        // The new avatar URL will come from the server response
        if (avatarFile) {
          // Revoke the old preview URL if it exists
          if (avatarPreview && avatarPreview.startsWith('blob:')) {
            URL.revokeObjectURL(avatarPreview);
          }
          setAvatarFile(null);
          setAvatarPreview(null);
        }
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        setSuccess('Personal information updated successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to update personal information');
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating personal information');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSavingPersonalInfo(false);
    }
  };

  const handleSavePassword = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Please fill in all password fields');
      setTimeout(() => setError(''), 5000);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New password and confirm password do not match');
      setTimeout(() => setError(''), 5000);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      setTimeout(() => setError(''), 5000);
      return;
    }

    setSavingPassword(true);

    try {
      // Note: The current API doesn't verify current password, but we'll send it
      // You may need to update the backend to verify current password first
      const response = await updateProfile(
        null, // Don't update name
        null, // Don't update email
        passwordData.newPassword, // Update password
        null // Don't update avatar
      );

      if (response.status === 'success') {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setSuccess('Password changed successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to change password');
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while changing password');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">User not found</div>
        </div>
      </DashboardLayout>
    );
  }

  const userName = user.name || 'User';
  const userEmail = user.email || '';
  const avatarUrl = getAvatarUrl();
  const initials = getInitials(userName);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <button
              onClick={() => navigate('/dashboard')}
              className="hover:text-[#2667FF] transition-colors"
            >
              Dashboard
            </button>
            <span>/</span>
            <span className="text-gray-900">Profile</span>
          </nav>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <div className="flex gap-6">
          {/* Sticky Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
              <nav className="space-y-2">
                <button
                  onClick={() => {
                    setActiveSection('personal-info');
                    document.getElementById('personal-info-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                    activeSection === 'personal-info'
                      ? 'bg-[#2667FF] text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-medium">Personal Info</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setActiveSection('change-password');
                    document.getElementById('change-password-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                    activeSection === 'change-password'
                      ? 'bg-[#2667FF] text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-medium">Change Password</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Personal Info Card */}
            <div id="personal-info-section" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Personal Information</h2>
                  <p className="text-sm text-gray-500">Details about your personal information.</p>
                </div>

                <div className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={personalInfo.name}
                      onChange={handlePersonalInfoChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2667FF] focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={personalInfo.email}
                      onChange={handlePersonalInfoChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2667FF] focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>

                  {/* Avatar Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avatar
                      {avatarFile && (
                        <span className="ml-2 text-xs text-orange-600 font-normal">
                          (New image selected - click "Save Changes" to update)
                        </span>
                      )}
                    </label>
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-3">
                        <button
                          onClick={handleAvatarClick}
                          type="button"
                          className="px-4 py-2 bg-[#2667FF] text-white rounded-lg hover:bg-[#1e52d9] transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          {avatarFile ? 'Change Image' : 'Choose file here'}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <div className={`h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 relative ${avatarFile ? 'border-orange-400' : 'border-gray-300'}`}>
                          {avatarUrl ? (
                            <img 
                              key={avatarUrl}
                              src={avatarUrl} 
                              alt={userName}
                              className="h-full w-full object-cover rounded-full"
                              style={{ 
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                zIndex: 10,
                                display: 'block'
                              }}
                              onError={(e) => {
                                console.error('Image load error:', avatarUrl);
                                e.target.style.display = 'none';
                                const fallback = e.target.parentElement.querySelector('.avatar-fallback');
                                if (fallback) {
                                  fallback.style.display = 'flex';
                                  fallback.style.zIndex = '10';
                                }
                              }}
                              onLoad={(e) => {
                                const fallback = e.target.parentElement.querySelector('.avatar-fallback');
                                if (fallback) {
                                  fallback.style.display = 'none';
                                }
                                e.target.style.display = 'block';
                              }}
                            />
                          ) : null}
                          <div 
                            className="avatar-fallback h-full w-full items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600 rounded-full absolute inset-0"
                            style={{ 
                              display: avatarUrl ? 'none' : 'flex',
                              zIndex: 0
                            }}
                          >
                            <span className="text-white font-semibold text-2xl">{initials}</span>
                          </div>
                          {avatarFile && (
                            <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full z-20">
                              New
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 text-center max-w-[120px]">
                          Please upload a valid image file. Size of image should not be more than 2MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSavePersonalInfo}
                      disabled={savingPersonalInfo}
                      className="px-6 py-2.5 bg-[#2667FF] text-white rounded-lg hover:bg-[#1e52d9] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingPersonalInfo ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
            </div>

            {/* Change Password Card */}
            <div id="change-password-section" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Change Password</h2>
                  <p className="text-sm text-gray-500">Details about your account password change.</p>
                </div>

                <div className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2667FF] focus:border-transparent"
                      placeholder="Enter Current Password"
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2667FF] focus:border-transparent"
                      placeholder="Enter New Password"
                    />
                  </div>

                  {/* Re-type New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Re-type New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2667FF] focus:border-transparent"
                      placeholder="Enter Re-type New Password"
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSavePassword}
                      disabled={savingPassword}
                      className="px-6 py-2.5 bg-[#2667FF] text-white rounded-lg hover:bg-[#1e52d9] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingPassword ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      {showCropModal && cropImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto animate-slideUp">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Crop Your Profile Image</h3>
              
              {/* Crop Area */}
              <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden mb-4" style={{ position: 'relative' }}>
                <Cropper
                  image={cropImage}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={onCropComplete}
                  cropShape="round"
                  showGrid={false}
                  restrictPosition={true}
                  style={{
                    containerStyle: {
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                    },
                  }}
                />
              </div>

              {/* Controls */}
              <div className="space-y-4">
                {/* Zoom Control */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zoom: {Math.round(zoom * 100)}%
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Rotation Controls */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rotation: {rotation}°
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setRotation(rotation - 15)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                      title="Rotate 15° left"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Left
                    </button>
                    <button
                      onClick={() => setRotation(rotation + 15)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                      title="Rotate 15° right"
                    >
                      Right
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setRotation(rotation - 90)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      title="Rotate 90° left"
                    >
                      ↺ 90°
                    </button>
                    <button
                      onClick={() => setRotation(rotation + 90)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      title="Rotate 90° right"
                    >
                      90° ↻
                    </button>
                    <button
                      onClick={() => {
                        setRotation(0);
                        setZoom(1);
                        setCrop({ x: 0, y: 0 });
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Reset All
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCancelCrop}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropComplete}
                  className="px-6 py-2.5 bg-[#2667FF] text-white rounded-lg hover:bg-[#1e52d9] transition-colors"
                >
                  Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default ProfilePage;

import React, { useState, useEffect, useContext } from 'react';
import AuthLayout from '../../layout/AuthLayout';
import AuthApi from '../../api/AuthApi';
import toast from 'react-hot-toast';
import { 
    FiUser, FiMail, FiLock, FiSave, FiEye, FiEyeOff, 
    FiSettings, FiArrowLeft, FiCheck 
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/AuthProvider';
import Loading, { ButtonLoader } from '../../components/Loading';

export default function AdminSettings() {
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext);
    
    // Profile state
    const [profile, setProfile] = useState({
        name: '',
        email: ''
    });
    
    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    // Loading states
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    
    // Show password states
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Active tab state
    const [activeTab, setActiveTab] = useState('profile');

    // Fetch user profile
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await AuthApi.getProfile();
            
            if (response.status) {
                setProfile({
                    name: response.user.name || '',
                    email: response.user.email || ''
                });
            } else {
                toast.error('Failed to load profile');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    // Handle profile update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!profile.name.trim() || !profile.email.trim()) {
            toast.error('Name and email are required');
            return;
        }
        
        try {
            setProfileLoading(true);
            const response = await AuthApi.updateProfile({
                name: profile.name.trim(),
                email: profile.email.trim()
            });
            
            if (response.status) {
                toast.success(response.message || 'Profile updated successfully');
                // Update user context
                setUser(response.user);
            } else {
                toast.error(response.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setProfileLoading(false);
        }
    };

    // Handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error('All password fields are required');
            return;
        }
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New password and confirm password do not match');
            return;
        }
        
        if (passwordData.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters long');
            return;
        }
        
        try {
            setPasswordLoading(true);
            const response = await AuthApi.changePassword(passwordData);
            
            if (response.status) {
                toast.success(response.message || 'Password changed successfully');
                // Clear form
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                toast.error(response.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error(error.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    // Handle profile input changes
    const handleProfileChange = (field, value) => {
        setProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle password input changes
    const handlePasswordInputChange = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <AuthLayout>
                <Loading 
                    variant="spinner" 
                    size="lg" 
                    message="Loading settings..."
                    theme="light"
                    fullPage={true}
                />
            </AuthLayout>
        );
    }

    return (
        <AuthLayout heading="Admin Settings">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex text-lg items-center text-blue-600 hover:text-blue-700"
                        >
                            <FiArrowLeft className="mr-2" size={16} />
                            Back to Dashboard
                        </button>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <div className="w-12 min-w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white">
                            <FiSettings size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
                            <p className="text-gray-600">Manage your account settings and preferences</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-[20px] shadow-sm border border-gray-200">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`py-4 px-1 border-b-2 font-medium text-normal md:text-lg ${
                                    activeTab === 'profile'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <FiUser className="inline mr-2" size={18} />
                                Profile
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`py-4 px-1 border-b-2 font-medium text-normal md:text-lg ${
                                    activeTab === 'password'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <FiLock className="inline mr-2" size={18} />
                                Change Password
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div>
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Profile Information</h3>
                                    <p className="text-normal text-gray-600">
                                        Update your account's profile information and email address.
                                    </p>
                                </div>

                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiUser className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                id="name"
                                                value={profile.name}
                                                onChange={(e) => handleProfileChange('name', e.target.value)}
                                                className="block w-full pl-10 pr-3 py-[14px] border border-gray-300 rounded-[10px] leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter your full name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiMail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                id="email"
                                                value={profile.email}
                                                onChange={(e) => handleProfileChange('email', e.target.value)}
                                                className="block w-full pl-10 pr-3 py-[14px] border border-gray-300 rounded-[10px] leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter your email address"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={profileLoading}
                                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold text-white btn hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                                profileLoading ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        >
                                            {profileLoading ? (
                                                <ButtonLoader size="sm" />
                                            ) : (
                                                <FiSave className="mr-2" size={16} />
                                            )}
                                            {profileLoading ? 'Updating...' : 'Update Profile'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Password Tab */}
                        {activeTab === 'password' && (
                            <div>
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Change Password</h3>
                                    <p className="text-normal text-gray-600">
                                        Update your account password. Your new password must be at least 6 characters long.
                                    </p>
                                </div>

                                <form onSubmit={handlePasswordChange} className="space-y-6">
                                    <div>
                                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiLock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                id="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                                                className="block w-full pl-10 pr-12 py-[14px] border border-gray-300 rounded-[10px] leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter your current password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? (
                                                    <FiEyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <FiEye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiLock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type={showNewPassword ? 'text' : 'password'}
                                                id="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                                                className="block w-full pl-10 pr-12 py-[14px] border border-gray-300 rounded-[10px] leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter your new password"
                                                minLength="6"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? (
                                                    <FiEyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <FiEye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FiCheck className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                id="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                                                className="block w-full pl-10 pr-12 py-[14px] border border-gray-300 rounded-[10px] leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Confirm your new password"
                                                minLength="6"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <FiEyeOff className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <FiEye className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={passwordLoading}
                                            className={`btn inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold  text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                                passwordLoading ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        >
                                            {passwordLoading ? (
                                                <ButtonLoader size="sm" />
                                            ) : (
                                                <FiLock className="mr-2" size={16} />
                                            )}
                                            {passwordLoading ? 'Changing...' : 'Change Password'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}

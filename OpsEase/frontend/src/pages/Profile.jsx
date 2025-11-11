import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout } = useAuth();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    
    if (!passwordData.newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setUpdating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Password updated successfully!');
    } catch (error) {
      toast.error('Failed to update password. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-red-600 bg-red-50 border-red-200';
      case 'manager': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'fieldAgent': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrator',
      manager: 'Manager',
      fieldAgent: 'Field Agent'
    };
    return labels[role] || role;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Profile Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account information and security settings</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Account Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user.name || 'Unknown User'}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Name</span>
                  <span className="text-sm text-gray-900">{user.name || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Email</span>
                  <span className="text-sm text-gray-900">{user.email}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Role</span>
                  <span className={`px-3 py-1 text-xs rounded-full font-semibold border ${getRoleColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-600">User ID</span>
                  <span className="text-sm text-gray-500 font-mono text-xs">{user.id}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Change Password</h2>
            
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                  minLength="6"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
              >
                {updating ? 'Updating...' : 'Update Password'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800">Security Notice</h4>
                  <p className="text-xs text-yellow-700 mt-1">
                    Choose a strong password that you haven't used elsewhere. This feature is coming soon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Account Actions</h3>
              <p className="text-sm text-gray-600 mt-1">Sign out of your account</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
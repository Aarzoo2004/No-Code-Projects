import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import Charts from '../components/Charts';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get('/dashboard/stats');
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard statistics');
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">OpsEase</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">Welcome, {user.name}!</h2>
          <p className="text-gray-600">Role: <span className="font-semibold capitalize">{user.role}</span></p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button
              onClick={fetchStats}
              className="ml-4 underline hover:text-red-800"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <LoadingSkeleton variant="dashboard" />
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold mb-2">Total Forms</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalForms || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <h3 className="text-lg font-semibold mb-2">Total Submissions</h3>
              <p className="text-3xl font-bold text-green-600">{stats.totalSubmissions || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <h3 className="text-lg font-semibold mb-2">Completion Rate</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.completionRate || '0.00'}%</p>
              <p className="text-sm text-gray-500 mt-1">Approved submissions</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
              <h3 className="text-lg font-semibold mb-2">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingCount || 0}</p>
              <p className="text-sm text-gray-500 mt-1">Awaiting review</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
              <h3 className="text-lg font-semibold mb-2">Approved</h3>
              <p className="text-3xl font-bold text-green-600">{stats.approvedCount || 0}</p>
              <p className="text-sm text-gray-500 mt-1">Accepted submissions</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <h3 className="text-lg font-semibold mb-2">Rejected</h3>
              <p className="text-3xl font-bold text-red-600">{stats.rejectedCount || 0}</p>
              <p className="text-sm text-gray-500 mt-1">Declined submissions</p>
            </div>
          </div>
        ) : null}

        {/* Recent Activity */}
        {stats && stats.recentSubmissions && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Recent Activity</h3>
            {stats.recentSubmissions.length > 0 ? (
              <div className="space-y-3">
                {stats.recentSubmissions.map((submission) => {
                  const getTimeAgo = (dateString) => {
                    if (!dateString) return 'Unknown';
                    const now = new Date();
                    const past = new Date(dateString);
                    const diffInMs = now - past;
                    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
                    const diffInDays = Math.floor(diffInHours / 24);
                    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

                    if (diffInMinutes < 1) return 'Just now';
                    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
                    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
                    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
                    
                    const diffInWeeks = Math.floor(diffInDays / 7);
                    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
                    
                    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  };

                  const getStatusBadge = (status) => {
                    const badges = {
                      approved: 'bg-green-100 text-green-800 border-green-300',
                      rejected: 'bg-red-100 text-red-800 border-red-300',
                      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    };
                    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-300';
                  };

                  return (
                    <button
                      key={submission._id}
                      onClick={() => navigate(`/submissions/${submission._id}`)}
                      className="w-full text-left border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-blue-300 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 mb-1">
                            {submission.formId?.title || 'Unknown Form'}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>by {submission.submittedBy?.name || submission.submittedBy?.email || 'Unknown'}</span>
                            <span>•</span>
                            <span>{getTimeAgo(submission.createdAt)}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full font-semibold border ${getStatusBadge(submission.status)}`}>
                          {submission.status.toUpperCase()}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No recent activity</p>
              </div>
            )}
          </div>
        )}

        {/* Submission Trends Chart */}
        {stats && stats.recentSubmissions && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Submission Trends</h3>
            <Charts submissions={stats.recentSubmissions} />
          </div>
        )}

        {/* Role-specific additional stats */}
        {stats && user.role === 'admin' && stats.usersByRole && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Users by Role</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.usersByRole.admin}</div>
                <div className="text-sm text-gray-600">Admins</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{stats.usersByRole.manager}</div>
                <div className="text-sm text-gray-600">Managers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.usersByRole.fieldAgent}</div>
                <div className="text-sm text-gray-600">Field Agents</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            {user.role === 'admin' || user.role === 'manager' ? (
              <>
                <button
                  onClick={() => navigate('/forms')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  View Forms
                </button>
                <button
                  onClick={() => navigate('/submissions')}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold"
                >
                  View Submissions
                </button>
                <button
                  onClick={() => navigate('/form-builder')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
                >
                  Create Form
                </button>
                <button
                  onClick={() => navigate('/reports')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Generate Reports
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/agent-forms')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Fill Forms
                </button>
                <button
                  onClick={() => navigate('/my-submissions')}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold"
                >
                  My Submissions
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
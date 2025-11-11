import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import API from '../utils/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function SubmissionList() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating, setUpdating] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, statusFilter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching submissions for role:', user?.role);
      const response = await API.get('/submissions');
      console.log('✅ Submissions loaded:', response.data.submissions.length);
      setSubmissions(response.data.submissions);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch submissions';
      setError(errorMsg);
      console.error('❌ Error fetching submissions:', err);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    if (statusFilter === 'all') {
      setFilteredSubmissions(submissions);
    } else {
      setFilteredSubmissions(submissions.filter(s => s.status === statusFilter));
    }
  };

  const handleStatusUpdate = async (submissionId, status) => {
    setUpdating(submissionId);
    setError('');

    try {
      console.log(`🔄 Updating submission ${submissionId} to ${status}`);
      await API.put(`/submissions/${submissionId}/status`, { status });
      
      // Update local state immediately for better UX
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(s => 
          s._id === submissionId ? { ...s, status } : s
        )
      );
      
      toast.success(`Submission ${status} successfully!`);
      console.log('✅ Status updated successfully');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update status';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('❌ Status update failed:', err);
      
      // Refresh to get correct state from server
      await fetchSubmissions();
    } finally {
      setUpdating(null);
    }
  };

  const handleRowClick = (submissionId) => {
    navigate(`/submissions/${submissionId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    };
    
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getCounts = () => {
    return {
      total: submissions.length,
      pending: submissions.filter(s => s.status === 'pending').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      rejected: submissions.filter(s => s.status === 'rejected').length
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-blue-600">Submissions</h1>
            <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
          </div>
          <LoadingSkeleton variant="stats" />
          <div className="mt-6">
            <LoadingSkeleton variant="table" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const counts = getCounts();
  const canUpdateStatus = user.role === 'admin' || user.role === 'manager';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Submissions</h1>
          <div className="flex gap-3">
            <button
              onClick={fetchSubmissions}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 font-medium flex items-center gap-2"
              title="Refresh submissions"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium"
            >
              ← Dashboard
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-4 underline hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 mb-1">Total Submissions</div>
            <div className="text-2xl font-bold text-blue-600">{counts.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
            <div className="text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{counts.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-1">Approved</div>
            <div className="text-2xl font-bold text-green-600">{counts.approved}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
            <div className="text-sm text-gray-600 mb-1">Rejected</div>
            <div className="text-2xl font-bold text-red-600">{counts.rejected}</div>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-gray-700">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All ({counts.total})</option>
              <option value="pending">Pending ({counts.pending})</option>
              <option value="approved">Approved ({counts.approved})</option>
              <option value="rejected">Rejected ({counts.rejected})</option>
            </select>
            <div className="ml-auto text-sm text-gray-600">
              Showing {filteredSubmissions.length} submission(s)
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        {submissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Submissions Yet</h3>
            <p className="text-gray-500">Submissions will appear here once field agents start filling forms.</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No {statusFilter} submissions</h3>
            <p className="text-gray-500">Try changing the filter to see other submissions.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Form Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    {canUpdateStatus && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubmissions.map((submission) => (
                    <tr
                      key={submission._id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(submission._id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {submission.formId?.title || 'Unknown Form'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {submission.submittedBy?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {submission.submittedBy?.email || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(submission.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs rounded-full font-semibold border ${getStatusBadge(submission.status)}`}>
                          {submission.status.toUpperCase()}
                        </span>
                      </td>
                      {canUpdateStatus && (
                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2">
                            {submission.status === 'pending' ? (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdate(submission._id, 'approved');
                                  }}
                                  disabled={updating === submission._id}
                                  className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                                >
                                  {updating === submission._id ? '...' : 'Approve'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdate(submission._id, 'rejected');
                                  }}
                                  disabled={updating === submission._id}
                                  className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                                >
                                  {updating === submission._id ? '...' : 'Reject'}
                                </button>
                              </>
                            ) : (
                              <span className="text-sm text-gray-500 italic">No actions</span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import API from '../utils/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function MySubmissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching my submissions...');
      const response = await API.get('/submissions');
      console.log('✅ My submissions loaded:', response.data.submissions.length);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-blue-600">My Submissions</h1>
            <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
          </div>
          <LoadingSkeleton variant="list" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const statusCounts = {
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">My Submissions</h1>
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

        {/* Stats Summary */}
        {submissions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
              <div className="text-sm text-gray-600 mb-1">Total Submissions</div>
              <div className="text-2xl font-bold text-blue-600">{submissions.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
              <div className="text-sm text-gray-600 mb-1">Pending Review</div>
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
              <div className="text-sm text-gray-600 mb-1">Approved</div>
              <div className="text-2xl font-bold text-green-600">{statusCounts.approved}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
              <div className="text-sm text-gray-600 mb-1">Rejected</div>
              <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
            </div>
          </div>
        )}

        {submissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Submissions Yet</h3>
            <p className="text-gray-500 mb-6">Start filling forms to see your submissions here.</p>
            <button
              onClick={() => navigate('/agent-forms')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Fill Forms
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission._id}
                onClick={() => navigate(`/submissions/${submission._id}`)}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-400"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                      {getStatusIcon(submission.status)}
                      {submission.formId?.title || 'Unknown Form'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Submitted {formatDate(submission.createdAt)}
                    </p>
                  </div>
                  <span className={`px-4 py-2 text-sm rounded-full font-semibold border ${getStatusBadge(submission.status)}`}>
                    {submission.status.toUpperCase()}
                  </span>
                </div>

                {submission.formId?.description && (
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {submission.formId.description}
                  </p>
                )}

                {/* Preview of submission data */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="text-sm text-gray-600">
                    {Object.entries(submission.data || {}).slice(0, 2).map(([key, value]) => (
                      <div key={key} className="flex gap-2 mb-1">
                        <span className="font-medium text-gray-700">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                        </span>
                        <span className="truncate">{String(value).substring(0, 50)}{String(value).length > 50 ? '...' : ''}</span>
                      </div>
                    ))}
                    {Object.keys(submission.data || {}).length > 2 && (
                      <span className="text-xs text-gray-500 italic">
                        +{Object.keys(submission.data || {}).length - 2} more fields
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end mt-3 text-sm text-blue-600 font-medium">
                  View Details
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
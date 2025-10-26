import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';

export default function SubmissionDetails() {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchSubmission();
  }, [id]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/submissions/${id}`);
      setSubmission(response.data.submission);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch submission');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    setUpdating(true);
    setError('');

    try {
      await API.put(`/submissions/${id}/status`, { status });
      await fetchSubmission();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const renderFieldValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div className="text-gray-600">Loading submission...</div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Submission Not Found</h2>
          <button
            onClick={() => navigate('/submissions')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Submissions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/submissions')}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Submissions
          </button>
          <h1 className="text-3xl font-bold text-blue-600">Submission Details</h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Form</h3>
              <p className="text-lg font-bold text-gray-900">
                {submission.formId?.title || 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Status</h3>
              <span className={`inline-block px-6 py-3 text-lg rounded-full font-bold border-2 ${getStatusBadge(submission.status)}`}>
                {submission.status.toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Submitted By</h3>
              <p className="text-lg font-bold text-gray-900">
                {submission.submittedBy?.name || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                {submission.submittedBy?.email || ''}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Date</h3>
              <p className="text-lg font-bold text-gray-900">
                {formatDate(submission.createdAt)}
              </p>
            </div>
          </div>

          {submission.formId?.description && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Description</h3>
              <p className="text-gray-700">{submission.formId.description}</p>
            </div>
          )}
        </div>

        {/* Submission Data */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Submission Data</h2>
          <div className="space-y-4">
            {Object.entries(submission.data || {}).map(([key, value]) => {
              const field = submission.formId?.fields?.find(f => 
                f.label.toLowerCase().replace(/[^a-z0-9]+/g, '_') === key
              );
              const displayKey = field?.label || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              
              return (
                <div key={key} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">{displayKey}</h3>
                  <p className="text-lg text-gray-900 whitespace-pre-wrap break-words">
                    {renderFieldValue(value)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons (for managers/admin only) */}
        {submission.status === 'pending' && user && (user.role === 'admin' || user.role === 'manager') && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Actions</h2>
            <div className="flex gap-4">
              <button
                onClick={() => handleStatusUpdate('approved')}
                disabled={updating}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
              >
                {updating ? 'Updating...' : 'Approve Submission'}
              </button>
              <button
                onClick={() => handleStatusUpdate('rejected')}
                disabled={updating}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
              >
                {updating ? 'Updating...' : 'Reject Submission'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


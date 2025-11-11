import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import API from '../utils/api';

export default function SubmissionDetails() {
  const { user } = useAuth();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      console.log('📄 Fetching submission:', id);
      const response = await API.get(`/submissions/${id}`);
      console.log('✅ Submission loaded:', response.data.submission);
      setSubmission(response.data.submission);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch submission';
      setError(errorMsg);
      console.error('❌ Error fetching submission:', err);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    if (!window.confirm(`Are you sure you want to ${status} this submission?`)) {
      return;
    }

    setUpdating(true);
    setError('');

    try {
      console.log(`🔄 Updating submission to ${status}`);
      await API.put(`/submissions/${id}/status`, { status });
      
      // Update local state immediately
      setSubmission(prev => ({
        ...prev,
        status
      }));
      
      toast.success(`Submission ${status} successfully!`);
      console.log('✅ Status updated successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update status';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('❌ Status update failed:', err);
      
      // Refresh to get correct state
      await fetchSubmission();
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

  const canUpdateStatus = () => {
    if (!user || !submission) return false;
    if (submission.status !== 'pending') return false;
    if (user.role === 'admin') return true;
    if (user.role === 'manager') {
      // Check if manager owns the form
      return submission.formId?.createdBy === user.id;
    }
    return false;
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
            onClick={() => {
              // Navigate based on user role
              if (user?.role === 'fieldAgent') {
                navigate('/my-submissions');
              } else {
                navigate('/submissions');
              }
            }}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to {user?.role === 'fieldAgent' ? 'My Submissions' : 'Submissions'}
          </button>
          <h1 className="text-3xl font-bold text-blue-600">Submission Details</h1>
          {submission.status !== 'pending' && (
            <div className="ml-auto">
              <span className={`px-4 py-2 text-sm rounded-full font-bold border-2 ${getStatusBadge(submission.status)}`}>
                {submission.status.toUpperCase()}
              </span>
            </div>
          )}
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

        {/* Submission Info Card */}
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
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Submission Date</h3>
              <p className="text-lg font-bold text-gray-900">
                {formatDate(submission.createdAt)}
              </p>
            </div>
          </div>

          {submission.formId?.description && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Form Description</h3>
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
        {canUpdateStatus() && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Actions</h2>
            <p className="text-gray-600 mb-4">
              Review the submission and choose an action:
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleStatusUpdate('approved')}
                disabled={updating}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approve Submission
                  </>
                )}
              </button>
              <button
                onClick={() => handleStatusUpdate('rejected')}
                disabled={updating}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject Submission
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Already Processed Message */}
        {submission.status !== 'pending' && (
          <div className={`rounded-lg shadow-md p-6 ${
            submission.status === 'approved' ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              {submission.status === 'approved' ? (
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <div>
                <h3 className={`text-lg font-bold ${submission.status === 'approved' ? 'text-green-800' : 'text-red-800'}`}>
                  This submission has been {submission.status}
                </h3>
                <p className={`text-sm ${submission.status === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
                  No further actions can be taken on this submission.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
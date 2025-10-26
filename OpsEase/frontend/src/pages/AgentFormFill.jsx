import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../utils/api';
import DynamicForm from '../components/DynamicForm';

export default function AgentFormFill() {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submissions, setSubmissions] = useState({});
  const navigate = useNavigate();

  // Fetch assigned forms and submissions on mount
  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await API.get('/forms');
      setForms(response.data.forms);
      
      // Fetch submissions for all forms
      await fetchSubmissionsForForms(response.data.forms);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch forms');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissionsForForms = async (formsList) => {
    try {
      const submissionsResponse = await API.get('/submissions');
      const submissionsMap = {};
      
      submissionsResponse.data.submissions.forEach(submission => {
        const formId = submission.formId._id || submission.formId;
        if (!submissionsMap[formId]) {
          submissionsMap[formId] = [];
        }
        submissionsMap[formId].push(submission);
      });
      
      setSubmissions(submissionsMap);
    } catch (err) {
      toast.error('Failed to fetch submissions');
    }
  };

  const handleFormClick = (form) => {
    setSelectedForm(form);
    setError('');
  };

  const handleBackToList = () => {
    setSelectedForm(null);
    setError('');
    fetchForms();
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError('');

    try {
      await API.post('/submissions', {
        formId: selectedForm._id,
        data: formData
      });
      
      toast.success('Form submitted successfully!');
      
      // Refresh submissions
      await fetchSubmissionsForForms(forms);
      
      // Return to form list after delay
      setTimeout(() => {
        handleBackToList();
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit form';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getSubmissionStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    };
    
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-300';
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

  // Show form filling interface
  if (selectedForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={handleBackToList}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Forms
            </button>
            <h2 className="text-2xl font-bold text-blue-600">Fill Form: {selectedForm.title}</h2>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md">
            <DynamicForm
              schema={selectedForm.fields}
              onSubmit={handleSubmit}
              title={selectedForm.title}
              description={selectedForm.description}
            />
          </div>

          {/* Submission History */}
          {submissions[selectedForm._id] && submissions[selectedForm._id].length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Submission History</h3>
              <div className="space-y-3">
                {submissions[selectedForm._id].map((submission, idx) => (
                  <div
                    key={submission._id || idx}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs rounded-full font-semibold border ${getSubmissionStatusBadge(submission.status)}`}>
                          {submission.status.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatDate(submission.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {Object.entries(submission.data || {}).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="truncate">
                          <span className="font-medium">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div className="text-gray-600">Loading forms...</div>
        </div>
      </div>
    );
  }

  // Show form list
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">My Assigned Forms</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {forms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Forms Assigned</h3>
            <p className="text-gray-500">You don't have any assigned forms yet. Contact your manager for assignments.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => {
              const formSubmissions = submissions[form._id] || [];
              const lastSubmission = formSubmissions[0]; // Most recent
              
              return (
                <div
                  key={form._id}
                  onClick={() => handleFormClick(form)}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-400"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{form.title}</h3>
                    {form.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{form.description}</p>
                    )}
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>{form.fields?.length || 0} fields</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <span>{formSubmissions.length} submission(s)</span>
                      </div>
                    </div>

                    {lastSubmission && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">Last submission:</span>
                          <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getSubmissionStatusBadge(lastSubmission.status)}`}>
                            {lastSubmission.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{formatDate(lastSubmission.createdAt)}</p>
                      </div>
                    )}
                    
                    <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors">
                      {formSubmissions.length > 0 ? 'Fill Again' : 'Fill Form'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


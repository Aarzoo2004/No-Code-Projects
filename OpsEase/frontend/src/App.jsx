import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from '../src/pages/Login.jsx';
import Dashboard from '../src/pages/Dashboard.jsx';
import FormBuilder from '../src/pages/FormBuilder.jsx';
import FormList from '../src/pages/FormList.jsx';
import AgentFormFill from '../src/pages/AgentFormFill.jsx';
import SubmissionList from '../src/pages/SubmissionList.jsx';
import SubmissionDetails from '../src/pages/SubmissionDetails.jsx';
import MySubmissions from '../src/pages/MySubmissions.jsx';
import Reports from '../src/pages/Reports.jsx';
import DynamicForm from '../src/components/DynamicForm.jsx';
import ErrorBoundary from '../src/components/ErrorBoundary.jsx';
import API from '../src/utils/api.js';

// Container component to handle data fetching for dynamic form
function DynamicFormContainer() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await API.get(`/forms/${id}`);
        setForm(response.data.form);
      } catch (err) {
        console.error('Failed to fetch form:', err);
        navigate('/forms');
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      await API.post('/submissions', {
        formId: id,
        data: formData
      });
      setSubmitSuccess('Form submitted successfully!');
      setTimeout(() => {
        navigate('/forms');
      }, 2000);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div className="text-gray-600">Loading form...</div>
        </div>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <>
      {submitSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-lg shadow-lg">
          {submitSuccess}
        </div>
      )}
      {submitError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded-lg shadow-lg">
          {submitError}
        </div>
      )}
      <DynamicForm
        schema={form.fields}
        onSubmit={handleSubmit}
        title={form.title}
        description={form.description}
      />
    </>
  );
}

// Container component for editing existing form
function FormBuilderContainer() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await API.get(`/forms/${id}`);
        setForm(response.data.form);
      } catch (err) {
        console.error('Failed to fetch form:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchForm();
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return <FormBuilder initialForm={form} />;
}

// Role-based protection component
function ProtectedRoute({ children, allowedRoles }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/form-builder" element={<FormBuilderContainer />} />
          <Route path="/form-builder/:id" element={<FormBuilderContainer />} />
          <Route path="/forms" element={<FormList />} />
          <Route path="/form/:id" element={<DynamicFormContainer />} />
          <Route path="/agent-forms" element={<AgentFormFill />} />
          <Route path="/submissions" element={<SubmissionList />} />
          <Route path="/submissions/:id" element={<SubmissionDetails />} />
          <Route path="/my-submissions" element={<MySubmissions />} />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <Reports />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;

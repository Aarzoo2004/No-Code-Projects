import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import FormList from './pages/FormList';
import AgentFormFill from './pages/AgentFormFill';
import SubmissionList from './pages/SubmissionList';
import SubmissionDetails from './pages/SubmissionDetails';
import MySubmissions from './pages/MySubmissions';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import DynamicForm from './components/DynamicForm';
import ErrorBoundary from './components/ErrorBoundary';
import API from './utils/api';

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

// Protected Route Component using AuthContext
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

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
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified and user doesn't have required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Public Route - Redirect to dashboard if already logged in
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

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

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      {/* Protected Routes - All authenticated users */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      <Route path="/forms" element={
        <ProtectedRoute>
          <FormList />
        </ProtectedRoute>
      } />

      <Route path="/submissions" element={
        <ProtectedRoute>
          <SubmissionList />
        </ProtectedRoute>
      } />

      <Route path="/submissions/:id" element={
        <ProtectedRoute>
          <SubmissionDetails />
        </ProtectedRoute>
      } />

      {/* Field Agent Routes */}
      <Route path="/agent-forms" element={
        <ProtectedRoute allowedRoles={['fieldAgent']}>
          <AgentFormFill />
        </ProtectedRoute>
      } />

      <Route path="/agent-forms/:formId" element={
        <ProtectedRoute allowedRoles={['fieldAgent']}>
          <AgentFormFill />
        </ProtectedRoute>
      } />

      <Route path="/my-submissions" element={
        <ProtectedRoute allowedRoles={['fieldAgent']}>
          <MySubmissions />
        </ProtectedRoute>
      } />

      {/* Manager/Admin Routes */}
      <Route path="/form-builder" element={
        <ProtectedRoute allowedRoles={['admin', 'manager']}>
          <FormBuilderContainer />
        </ProtectedRoute>
      } />

      <Route path="/form-builder/:id" element={
        <ProtectedRoute allowedRoles={['admin', 'manager']}>
          <FormBuilderContainer />
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute allowedRoles={['admin', 'manager']}>
          <Reports />
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Catch-all for 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
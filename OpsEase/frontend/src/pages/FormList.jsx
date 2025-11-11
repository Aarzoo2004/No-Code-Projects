import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function FormList() {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assigningForm, setAssigningForm] = useState(null);
  const [agentIds, setAgentIds] = useState([]);
  const [agents, setAgents] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const navigate = useNavigate();

  const fetchForms = async () => {
    try {
      console.log('📋 Fetching forms for user role:', user?.role);
      const response = await API.get('/forms');
      console.log('✅ Forms received:', response.data.forms.length);
      setForms(response.data.forms);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch forms';
      setError(errorMsg);
      console.error('❌ Error fetching forms:', err);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await API.get('/users', { params: { role: 'fieldAgent' } });
      setAgents(response.data.users || []);
      console.log('👥 Field agents loaded:', response.data.users.length);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
      setAgents([]);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'manager')) {
      fetchAgents();
    }
    fetchForms();
  }, [user]);

  const handleDelete = async (formId) => {
    if (!window.confirm('Are you sure you want to delete this form?')) {
      return;
    }

    try {
      await API.delete(`/forms/${formId}`);
      setForms(forms.filter(form => form._id !== formId));
      toast.success('Form deleted successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to delete form';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleAssign = async () => {
    try {
      await API.put(`/forms/${assigningForm}/assign`, { agentIds });
      setShowAssignModal(false);
      setAssigningForm(null);
      setAgentIds([]);
      toast.success('Form assigned successfully');
      fetchForms(); // Refresh to show updated assignments
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to assign form';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const openAssignModal = (formId) => {
    const form = forms.find(f => f._id === formId);
    setAssigningForm(formId);
    setAgentIds(form.assignedTo || []);
    setShowAssignModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getFilteredForms = () => {
    return forms.filter(form => {
      // Filter by search query (case-insensitive)
      const matchesSearch = !searchQuery || 
        form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (form.description && form.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by status
      const matchesStatus = filterStatus === 'All' || 
        (filterStatus === 'Active' && form.assignedTo && form.assignedTo.length > 0) ||
        (filterStatus === 'Inactive' && (!form.assignedTo || form.assignedTo.length === 0));
      
      return matchesSearch && matchesStatus;
    });
  };

  // Check if user can manage this form
  const canManageForm = (form) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'manager' && form.createdBy?._id === user.id) return true;
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-blue-600">Forms</h1>
            <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
          </div>
          <LoadingSkeleton variant="card" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">
            {user.role === 'fieldAgent' ? 'Available Forms' : 'Manage Forms'}
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium"
            >
              ← Dashboard
            </button>
            {(user.role === 'admin' || user.role === 'manager') && (
              <button
                onClick={() => navigate('/form-builder')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                + Create New Form
              </button>
            )}
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

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Forms
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title or description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Dropdown (Admin/Manager only) */}
            {(user.role === 'admin' || user.role === 'manager') && (
              <div className="md:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All Forms</option>
                  <option value="Active">Assigned</option>
                  <option value="Inactive">Unassigned</option>
                </select>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {getFilteredForms().length} of {forms.length} forms
          </div>
        </div>

        {getFilteredForms().length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {forms.length === 0 ? 'No forms found' : 'No forms match your search'}
            </h3>
            <p className="text-gray-500 mb-6">
              {forms.length === 0 
                ? user.role === 'fieldAgent' 
                  ? 'No forms have been assigned to you yet'
                  : 'Get started by creating your first form'
                : 'Try adjusting your search terms or filters'
              }
            </p>
            {(user.role === 'admin' || user.role === 'manager') && forms.length === 0 && (
              <button
                onClick={() => navigate('/form-builder')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                + Create Your First Form
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredForms().map((form) => (
              <div key={form._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{form.title}</h3>
                  {form.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{form.description}</p>
                  )}
                  <div className="space-y-1 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Created: {formatDate(form.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Assigned: {form.assignedTo?.length || 0} agent(s)</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {canManageForm(form) && (
                      <>
                        <button
                          onClick={() => openAssignModal(form._id)}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => navigate(`/form-builder/${form._id}`)}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(form._id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {user.role === 'fieldAgent' && (
                      <button
                        onClick={() => navigate(`/agent-forms/${form._id}`)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                      >
                        Fill Form
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] flex flex-col">
              <h2 className="text-xl font-bold mb-4">Assign Form to Field Agents</h2>
              <div className="space-y-2 mb-4 overflow-y-auto flex-1">
                {agents.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No field agents available</p>
                ) : (
                  agents.map((agent) => (
                    <label key={agent._id} className="flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={agentIds.includes(agent._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAgentIds([...agentIds, agent._id]);
                          } else {
                            setAgentIds(agentIds.filter(id => id !== agent._id));
                          }
                        }}
                        className="mr-3 h-4 w-4 text-blue-600"
                      />
                      <span>{agent.name} ({agent.email})</span>
                    </label>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAssign}
                  disabled={agentIds.length === 0}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Assign ({agentIds.length})
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setAssigningForm(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
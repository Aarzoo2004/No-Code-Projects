import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function FormList() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [assigningForm, setAssigningForm] = useState(null);
  const [agentIds, setAgentIds] = useState([]);
  const [agents, setAgents] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const navigate = useNavigate();

  const fetchForms = async () => {
    try {
      const response = await API.get('/forms');
      setForms(response.data.forms);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch forms');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await API.get('/users', { params: { role: 'fieldAgent' } });
      setAgents(response.data.users || []);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
      setAgents([]);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const parsedUser = userData ? JSON.parse(userData) : null;
    if (parsedUser) {
      setUser(parsedUser);
      if (parsedUser.role === 'admin' || parsedUser.role === 'manager') {
        fetchAgents();
      }
    }
    fetchForms();
  }, []);

  const handleDelete = async (formId) => {
    if (!window.confirm('Are you sure you want to delete this form?')) {
      return;
    }

    try {
      await API.delete(`/forms/${formId}`);
      setForms(forms.filter(form => form._id !== formId));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete form');
    }
  };

  const handleAssign = async () => {
    try {
      await API.put(`/forms/${assigningForm}/assign`, { agentIds });
      setShowAssignModal(false);
      setAssigningForm(null);
      setAgentIds([]);
      fetchForms();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign form');
    }
  };

  const openAssignModal = (formId) => {
    setAssigningForm(formId);
    const form = forms.find(f => f._id === formId);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-blue-600">My Forms</h1>
            <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
          </div>
          <LoadingSkeleton variant="card" />
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">My Forms</h1>
          {(user.role === 'admin' || user.role === 'manager') && (
            <button
              onClick={() => navigate('/form-builder')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              + Create New Form
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
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

            {/* Filter Dropdown */}
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
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
                ? 'Get started by creating your first form'
                : 'Try adjusting your search terms or filters'
              }
            </p>
            {(user.role === 'admin' || user.role === 'manager') && (
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
                    {(user.role === 'admin' || (user.role === 'manager' && form.createdBy?._id === user.id)) && (
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
                    {(user.role === 'fieldAgent' || !user.role) && (
                      <button
                        onClick={() => navigate(`/form/${form._id}`)}
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
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Assign Form to Agents</h2>
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {agents.map((agent) => (
                  <label key={agent._id} className="flex items-center cursor-pointer">
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
                      className="mr-2"
                    />
                    <span>{agent.name} ({agent.email})</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAssign}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Assign
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


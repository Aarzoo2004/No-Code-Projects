import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../utils/api';
import FormPreview from '../components/FormPreview';

export default function FormBuilder({ initialForm }) {
  const { id } = useParams();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedSchema, setGeneratedSchema] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [error, setError] = useState('');
  const [editingField, setEditingField] = useState(null);
  const navigate = useNavigate();

  // Load form data when editing
  useEffect(() => {
    if (initialForm) {
      setFormTitle(initialForm.title);
      setFormDescription(initialForm.description);
      setGeneratedSchema(initialForm.fields);
    }
  }, [initialForm]);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await API.post('/forms/generate', { description });
      setGeneratedSchema(response.data.schema);
      toast.success('Form schema generated successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to generate form schema';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveForm = async () => {
    if (!formTitle.trim()) {
      setError('Please enter a form title');
      return;
    }

    if (!generatedSchema || generatedSchema.length === 0) {
      setError('Please generate a form schema first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (id && initialForm) {
        // Update existing form
        await API.put(`/forms/${id}`, {
          title: formTitle,
          description: formDescription,
          schema: generatedSchema
        });
        toast.success('Form updated successfully!');
      } else {
        // Create new form
        await API.post('/forms', {
          title: formTitle,
          description: formDescription,
          schema: generatedSchema
        });
        toast.success('Form saved successfully!');
      }
      setTimeout(() => {
        navigate('/forms');
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to save form';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditField = (index) => {
    setEditingField(index);
  };

  const handleSaveField = (updatedField) => {
    const updatedSchema = [...generatedSchema];
    updatedSchema[editingField] = updatedField;
    setGeneratedSchema(updatedSchema);
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
  };

  const handleDeleteField = (index) => {
    const updatedSchema = generatedSchema.filter((_, i) => i !== index);
    setGeneratedSchema(updatedSchema);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-blue-600">
              {initialForm ? 'Edit Form' : 'AI Form Builder'}
            </h1>
            <button
              onClick={() => navigate('/forms')}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              ← Back to Forms
            </button>
          </div>
          
          {/* Error Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* AI Description Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Describe your form (AI will generate the fields)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Create a customer feedback form with fields for name, email, rating (1-5), and comments..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate with AI'
              )}
            </button>
          </div>

          {/* Generated Fields Preview */}
          {generatedSchema && generatedSchema.length > 0 && (
            <>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h2 className="text-xl font-semibold text-blue-600 mb-4">Generated Form Fields</h2>
                <FormPreview
                  schema={generatedSchema}
                  onEdit={handleEditField}
                  onDelete={handleDeleteField}
                  editingField={editingField}
                  onSaveField={handleSaveField}
                  onCancelEdit={handleCancelEdit}
                />
              </div>

              {/* Form Title and Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-blue-600 mb-4">Form Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Form Title *
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g., Customer Feedback Form"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Form Description
                    </label>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Optional description for your form"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              {/* Save Form Button */}
              <button
                onClick={handleSaveForm}
                disabled={loading || !formTitle.trim()}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {id && initialForm ? 'Update Form' : 'Save Form'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


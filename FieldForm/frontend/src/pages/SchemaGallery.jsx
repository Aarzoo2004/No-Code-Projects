// frontend/src/pages/SchemaGallery.jsx
import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Calendar, ExternalLink } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

export default function SchemaGallery({ onSelectSchema, onBack }) {
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSchemas();
  }, []);

  const loadSchemas = async () => {
    try {
      const response = await api.getAllSchemas();
      setSchemas(response.schemas || []);
    } catch (err) {
      setError('Failed to load schemas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSchemaClick = async (schemaId) => {
    try {
      const response = await api.getSchemaById(schemaId);
      onSelectSchema(response.id, response.schema);
    } catch (err) {
      setError('Failed to load schema details');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner message="Loading schemas..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Schema Gallery</h1>
          <p className="text-gray-600">Browse and use existing form schemas</p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        {/* Schema Grid */}
        {schemas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Schemas Yet</h3>
            <p className="text-gray-600 mb-6">
              Generate your first schema to see it here
            </p>
            <button
              onClick={onBack}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Create Schema
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemas.map((schema) => (
              <div
                key={schema.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all cursor-pointer"
                onClick={() => handleSchemaClick(schema.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-primary-100 rounded-lg p-3">
                    <FileText className="w-6 h-6 text-primary-600" />
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {schema.title}
                </h3>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{schema.fieldCount} fields</span>
                  </div>
                  {schema.createdAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(schema.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
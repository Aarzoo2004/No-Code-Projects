// frontend/src/pages/FormView.jsx
import { useState } from 'react';
import { ArrowLeft, CheckCircle, Bell, Code, Eye } from 'lucide-react';
import DynamicForm from '../components/DynamicForm';
import Alert from '../components/Alert';
import api from '../services/api';

export default function FormView({ schemaId, schema, onBack }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [showSchema, setShowSchema] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await api.submitForm(schemaId, formData);
      console.log('Form submitted:', response);
      
      setSubmitResult({
        type: 'success',
        data: response
      });

      // Scroll to result
      setTimeout(() => {
        document.getElementById('submit-result')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitResult({
        type: 'error',
        message: err.response?.data?.details || err.message || 'Failed to submit form'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Generator
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {schema.title}
                </h1>
                <p className="text-gray-600">
                  Fill out the form below. Fields marked with <span className="text-red-500">*</span> are required.
                </p>
              </div>
              
              <button
                onClick={() => setShowSchema(!showSchema)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                {showSchema ? <Eye className="w-4 h-4" /> : <Code className="w-4 h-4" />}
                {showSchema ? 'Hide' : 'View'} Schema
              </button>
            </div>

            {/* Schema Preview */}
            {showSchema && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Generated Schema:</p>
                <pre className="text-xs text-gray-800 overflow-x-auto">
                  {JSON.stringify(schema, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <DynamicForm 
          schema={schema} 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />

        {/* Submit Result */}
        {submitResult && (
          <div id="submit-result" className="mt-8">
            {submitResult.type === 'success' ? (
              <div className="bg-white rounded-xl shadow-lg border border-green-200 p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Form Submitted Successfully!
                    </h3>
                    <p className="text-gray-600">
                      Your form has been validated and saved.
                    </p>
                  </div>
                </div>

                {/* Notifications */}
                {submitResult.data.hasNotifications && (
                  <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Bell className="w-5 h-5 text-amber-600" />
                      <h4 className="font-semibold text-amber-900">
                        Notifications Triggered ({submitResult.data.notifications.length})
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {submitResult.data.notifications.map((notif, idx) => (
                        <div key={idx} className="bg-white p-3 rounded border border-amber-200">
                          <p className="text-sm font-medium text-gray-900">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Condition: {notif.field} {notif.condition}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success Actions */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Submit Another
                  </button>
                  <button
                    onClick={onBack}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Create New Form
                  </button>
                </div>
              </div>
            ) : (
              <Alert
                type="error"
                message={submitResult.message}
                onClose={() => setSubmitResult(null)}
              />
            )}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Form ID: <code className="bg-gray-100 px-2 py-1 rounded">{schemaId}</code></p>
        </div>
      </div>
    </div>
  );
}
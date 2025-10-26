// frontend/src/pages/Home.jsx
import { useState } from 'react';
import { Sparkles, ArrowRight, FileText, Zap, Shield, Workflow } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

export default function Home({ onSchemaGenerated, onShowGallery }) {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const examplePrompts = [
    {
      title: 'Electrical Pole Inspection',
      prompt: 'Create a field inspection form for electrical poles: fields — inspector name, pole id, photos, voltage, remarks; validation: voltage between 0–1000; notify manager if voltage > 400'
    },
    {
      title: 'Equipment Maintenance',
      prompt: 'Create a maintenance log form: equipment id, technician name, maintenance date, hours worked, parts replaced, condition rating (excellent to critical), notes; notify if condition is critical'
    },
    {
      title: 'Site Safety Audit',
      prompt: 'Create a safety audit form: auditor name, site location, audit date, safety score (0-100), hazards identified, corrective actions, photos; notify if score below 70'
    }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a form description');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const response = await api.generateSchema(prompt, title);
      console.log('Schema generated:', response);
      
      // Call parent callback with schema data
      if (onSchemaGenerated) {
        onSchemaGenerated(response.id, response.schema);
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.response?.data?.details || err.message || 'Failed to generate schema');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (example) => {
    setTitle(example.title);
    setPrompt(example.prompt);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered No-Code Platform
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            FieldForm AI
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Transform natural language into working field forms with validation, 
            workflows, and real-time notifications — powered by AI.
          </p>

          {onShowGallery && (
            <button
              onClick={onShowGallery}
              className="mb-8 inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg border-2 border-gray-300 hover:border-primary-400 font-medium transition-all shadow-sm"
            >
              <FileText className="w-5 h-5" />
              Browse Existing Forms
            </button>
          )}

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">Instant Generation</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Smart Validation</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <Workflow className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Auto Workflows</span>
            </div>
          </div>
        </div>

        {/* Main Generator Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Generate Your Form
            </h2>

            {error && (
              <div className="mb-6">
                <Alert 
                  type="error" 
                  message={error} 
                  onClose={() => setError(null)} 
                />
              </div>
            )}

            {/* Title Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Electrical Pole Inspection Form"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                disabled={isGenerating}
              />
            </div>

            {/* Prompt Textarea */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe Your Form in Plain English
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: Create a field inspection form for electrical poles with inspector name, pole id, voltage reading (0-1000), photos, and remarks. Notify manager if voltage exceeds 400."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                disabled={isGenerating}
              />
              <p className="mt-2 text-sm text-gray-500">
                💡 Tip: Mention fields, data types, validation rules, and notification conditions
              </p>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Form
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Example Prompts */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Try These Examples
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  disabled={isGenerating}
                  className="bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary-400 rounded-xl p-4 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {example.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {example.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isGenerating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md">
              <LoadingSpinner 
                size="lg" 
                message="AI is analyzing your requirements and generating the form schema..." 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import FormView from './pages/FormView';
import SchemaGallery from './pages/SchemaGallery';
import api from './services/api';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'form', or 'gallery'
  const [schemaId, setSchemaId] = useState(null);
  const [schema, setSchema] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      const health = await api.healthCheck();
      console.log('Backend health:', health);
      setBackendStatus('connected');
    } catch (err) {
      console.error('Backend connection failed:', err);
      setBackendStatus('disconnected');
    }
  };

  const handleSchemaGenerated = (id, generatedSchema) => {
    setSchemaId(id);
    setSchema(generatedSchema);
    setCurrentView('form');
  };

  const handleSelectSchema = (id, selectedSchema) => {
    setSchemaId(id);
    setSchema(selectedSchema);
    setCurrentView('form');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSchemaId(null);
    setSchema(null);
  };

  const handleShowGallery = () => {
    setCurrentView('gallery');
  };

  if (backendStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-700">Connecting to backend...</p>
          </div>
        </div>
      </div>
    );
  }

  if (backendStatus === 'disconnected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Backend Disconnected
            </h2>
            <p className="text-gray-600 mb-6">
              Cannot connect to the backend server at <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:5000</code>
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-6">
              <p className="text-sm font-semibold text-blue-900 mb-2">Quick Fix:</p>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Open a terminal in the backend folder</li>
                <li>Run: <code className="bg-white px-2 py-0.5 rounded">npm run dev</code></li>
                <li>Wait for "Server running on port 5000"</li>
                <li>Click the button below</li>
              </ol>
            </div>
            <button
              onClick={checkBackend}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentView === 'home' && (
        <Home 
          onSchemaGenerated={handleSchemaGenerated}
          onShowGallery={handleShowGallery}
        />
      )}
      
      {currentView === 'gallery' && (
        <SchemaGallery
          onSelectSchema={handleSelectSchema}
          onBack={handleBackToHome}
        />
      )}
      
      {currentView === 'form' && schema && (
        <FormView 
          schemaId={schemaId}
          schema={schema}
          onBack={handleBackToHome}
        />
      )}
    </>
  );
}

export default App;
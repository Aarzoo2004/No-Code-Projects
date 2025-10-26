// frontend/src/components/DynamicForm.jsx
import { useState } from 'react';
import { Send } from 'lucide-react';

export default function DynamicForm({ schema, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error for this field when user types
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    schema.fields.forEach(field => {
      const value = formData[field.name];
      
      // Required field validation
      if (field.required && (!value || value === '')) {
        newErrors[field.name] = `${field.label} is required`;
        return;
      }
      
      // Skip if optional and empty
      if (!value || value === '') return;
      
      // Number validation
      if (field.type === 'number') {
        const num = parseFloat(value);
        if (isNaN(num)) {
          newErrors[field.name] = `${field.label} must be a number`;
        } else {
          if (field.min !== undefined && num < field.min) {
            newErrors[field.name] = `Must be at least ${field.min}`;
          }
          if (field.max !== undefined && num > field.max) {
            newErrors[field.name] = `Must be at most ${field.max}`;
          }
        }
      }
      
      // Email validation
      if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.name] = 'Invalid email address';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field) => {
    const value = formData[field.name] || '';
    const hasError = errors[field.name];
    
    const baseInputClass = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
      hasError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
    }`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            required={field.required}
            rows={4}
            className={baseInputClass}
          />
        );

      case 'select':
        return (
          <select
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
            className={baseInputClass}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            min={field.min}
            max={field.max}
            required={field.required}
            className={baseInputClass}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            required={field.required}
            className={baseInputClass}
          />
        );

      case 'file':
        return (
          <input
            type="file"
            name={field.name}
            onChange={(e) => handleChange(field.name, e.target.files[0]?.name || '')}
            required={field.required}
            className={`${baseInputClass} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100`}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              name={field.name}
              checked={value === true || value === 'true'}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="ml-3 text-sm text-gray-600">{field.placeholder || 'Yes'}</span>
          </div>
        );

      case 'email':
        return (
          <input
            type="email"
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder || 'email@example.com'}
            required={field.required}
            className={baseInputClass}
          />
        );

      default: // string
        return (
          <input
            type="text"
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            required={field.required}
            className={baseInputClass}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{schema.title}</h2>
        
        <div className="space-y-5">
          {schema.fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
                {field.notifyIf && (
                  <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    Alert if {field.notifyIf}
                  </span>
                )}
              </label>
              
              {renderField(field)}
              
              {errors[field.name] && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span className="text-red-500">⚠</span> {errors[field.name]}
                </p>
              )}
              
              {field.min !== undefined && field.max !== undefined && field.type === 'number' && (
                <p className="text-xs text-gray-500">
                  Range: {field.min} - {field.max}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Submit Form
          </>
        )}
      </button>
    </form>
  );
}
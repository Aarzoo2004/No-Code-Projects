import { useState } from 'react';

export default function DynamicForm({ schema = [], onSubmit, title, description }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate field name from label
  const getFieldName = (label) => {
    return label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  };

  // Handle input change
  const handleChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Validate all required fields
  const validateForm = () => {
    const newErrors = {};
    
    schema.forEach(field => {
      const fieldName = getFieldName(field.label);
      
      if (field.required && (!formData[fieldName] || formData[fieldName].toString().trim() === '')) {
        newErrors[fieldName] = `${field.label} is required`;
      }
      
      // Additional validation for email
      if (field.type === 'email' && formData[fieldName]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[fieldName])) {
          newErrors[fieldName] = 'Please enter a valid email address';
        }
      }
      
      // Additional validation for number
      if (field.type === 'number' && formData[fieldName] && isNaN(formData[fieldName])) {
        newErrors[fieldName] = 'Please enter a valid number';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render different field types
  const renderField = (field, index) => {
    const fieldName = getFieldName(field.label);
    const hasError = errors[fieldName];
    const value = formData[fieldName] || '';

    const commonClasses = `w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
      hasError ? 'border-red-500' : 'border-gray-300'
    }`;

    return (
      <div key={index} className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {field.label} 
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {field.type === 'textarea' ? (
          <>
            <textarea
              value={value}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              placeholder={field.placeholder}
              rows={field.rows || 4}
              className={commonClasses}
              required={field.required}
            />
            {hasError && (
              <p className="text-red-500 text-sm mt-1">{errors[fieldName]}</p>
            )}
          </>
        ) : field.type === 'select' ? (
          <>
            <select
              value={value}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              className={commonClasses}
              required={field.required}
            >
              <option value="">{field.placeholder || 'Select an option'}</option>
              {field.options?.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {hasError && (
              <p className="text-red-500 text-sm mt-1">{errors[fieldName]}</p>
            )}
          </>
        ) : field.type === 'file' ? (
          <>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleChange(fieldName, file);
                }
              }}
              accept={field.accept}
              className={commonClasses}
              required={field.required}
            />
            {hasError && (
              <p className="text-red-500 text-sm mt-1">{errors[fieldName]}</p>
            )}
          </>
        ) : (
          <>
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              placeholder={field.placeholder}
              className={commonClasses}
              required={field.required}
              min={field.min}
              max={field.max}
              step={field.step}
            />
            {hasError && (
              <p className="text-red-500 text-sm mt-1">{errors[fieldName]}</p>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          {title && (
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
          )}
          {description && (
            <p className="text-gray-600 mb-8">{description}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {schema.map((field, index) => renderField(field, index))}

            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Form'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

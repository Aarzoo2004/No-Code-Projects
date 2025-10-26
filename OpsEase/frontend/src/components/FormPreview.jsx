import { useState } from 'react';

export default function FormPreview({ schema, onEdit, onDelete, editingField, onSaveField, onCancelEdit }) {
  const [fieldData, setFieldData] = useState(null);

  const handleStartEdit = (index) => {
    setFieldData({ ...schema[index], index });
    onEdit(index);
  };

  const handleSave = () => {
    onSaveField(fieldData);
    setFieldData(null);
  };

  const handleCancel = () => {
    setFieldData(null);
    onCancelEdit();
  };

  const getFieldTypeBadge = (type) => {
    const colors = {
      text: 'bg-blue-100 text-blue-800 border-blue-200',
      email: 'bg-green-100 text-green-800 border-green-200',
      number: 'bg-purple-100 text-purple-800 border-purple-200',
      date: 'bg-orange-100 text-orange-800 border-orange-200',
      textarea: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      select: 'bg-pink-100 text-pink-800 border-pink-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Edit modal
  if (editingField !== null && fieldData) {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-blue-500 shadow-lg mb-4">
        <h3 className="text-lg font-semibold mb-4 text-blue-600">Edit Field</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label *
            </label>
            <input
              type="text"
              value={fieldData.label}
              onChange={(e) => setFieldData({ ...fieldData, label: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Field label"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={fieldData.placeholder || ''}
              onChange={(e) => setFieldData({ ...fieldData, placeholder: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter placeholder text"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={fieldData.required || false}
              onChange={(e) => setFieldData({ ...fieldData, required: e.target.checked })}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-2"
            />
            <label className="text-sm font-medium text-gray-700">
              Required field
            </label>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {schema.map((field, index) => (
        <div
          key={index}
          className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all"
        >
          {/* Header with label and badges */}
          <div className="mb-3">
            <h4 className="font-semibold text-gray-800 mb-2 text-lg">{field.label}</h4>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 text-xs rounded-full font-semibold border ${getFieldTypeBadge(field.type)}`}>
                {field.type}
              </span>
              {field.required && (
                <span className="px-3 py-1 text-xs rounded-full font-semibold bg-red-100 text-red-800 border border-red-200">
                  Required
                </span>
              )}
            </div>
          </div>

          {/* Placeholder text */}
          {field.placeholder && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 italic">
                "{field.placeholder}"
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-3 border-t border-gray-200">
            <button
              onClick={() => handleStartEdit(index)}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2"
              title="Edit field"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => onDelete(index)}
              className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 font-medium text-sm flex items-center justify-center gap-2"
              title="Delete field"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

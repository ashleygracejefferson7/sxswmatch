import React from 'react';

const AskSection = ({ index, data, onChange, onRemove, categories, isRequired }) => {
  return (
    <div className={`${index > 0 ? 'mt-5' : ''} ${index < 2 ? 'pb-5 border-b' : ''}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium">
          Ask #{index + 1} {isRequired && <span className="text-red-500">*</span>}
        </h3>
        {!isRequired && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-gray-500 hover:text-red-500"
          >
            Remove
          </button>
        )}
      </div>
      
      <div className="mt-3 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name={`category`}
            value={data.category}
            onChange={(e) => onChange({ ...data, category: e.target.value })}
            required={isRequired}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Details</label>
          <textarea
            name={`details`}
            value={data.details}
            onChange={(e) => onChange({ ...data, details: e.target.value })}
            required={isRequired}
            placeholder="Describe specifically what you're looking for..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            rows="2"
          />
        </div>
      </div>
    </div>
  );
};

export default AskSection;

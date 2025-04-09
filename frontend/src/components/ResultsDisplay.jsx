import React from 'react';

const ResultsDisplay = ({ results }) => {
  // Helper function to render sections
  const renderSection = (title, items) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="mb-4">
        <h3 className="text-md font-medium text-gray-700 mb-2">{title}:</h3>
        <ul className="list-disc list-inside pl-2 space-y-1">
          {items.map((item, index) => (
            <li key={index} className="text-gray-600">{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Analysis Results</h2>
      
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-md font-medium text-gray-700 mb-2">Detected Job Title:</h3>
        <p className="text-lg font-semibold text-primary-700">{results.title}</p>
      </div>
      
      {results.sections && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-md font-medium text-gray-700 mb-2">Extracted Sections:</h3>
          
          {renderSection("Skills", results.sections.skills)}
          {renderSection("Experience", results.sections.experience)}
          {renderSection("Qualifications", results.sections.qualifications)}
          {renderSection("Responsibilities", results.sections.responsibilities)}
        </div>
      )}
      
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-md font-medium text-gray-700 mb-2">Embedding Generated:</h3>
        <p>A <span className="font-semibold text-primary-700">{results.embedding.length}</span>-dimensional vector has been created.</p>
        <p className="text-sm text-gray-500 mt-2">
          This embedding can be used for job matching and similarity comparisons.
        </p>
      </div>
    </div>
  );
};

export default ResultsDisplay;

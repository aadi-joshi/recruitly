import React, { useState, useEffect } from 'react';
import { FiFileText, FiChevronDown, FiChevronUp, FiTag, FiList, FiBarChart } from 'react-icons/fi';

const ResultsDisplay = ({ results }) => {
  const [sectionsExpanded, setSectionsExpanded] = useState(true);
  const [embeddingsExpanded, setEmbeddingsExpanded] = useState(false);
  const [visibleSections, setVisibleSections] = useState([]);

  useEffect(() => {
    if (results && results.sections) {
      // Animate sections appearing one by one
      const sections = Object.keys(results.sections).filter(key => 
        Array.isArray(results.sections[key]) && results.sections[key].length > 0
      );
      
      sections.forEach((section, index) => {
        setTimeout(() => {
          setVisibleSections(prev => [...prev, section]);
        }, 150 * index);
      });
    }
  }, [results]);

  // Helper function to render sections
  const renderSection = (title, items, sectionKey) => {
    if (!items || items.length === 0) return null;
    if (!visibleSections.includes(sectionKey)) return null;
    
    return (
      <div className="mb-4 stagger-item">
        <h3 className="text-md font-medium text-gray-700 mb-2 flex items-center">
          <FiList className="mr-2 text-primary-500" />
          {title}:
        </h3>
        <ul className="list-disc list-inside pl-2 space-y-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
          {items.map((item, index) => (
            <li key={index} className="text-gray-700 stagger-item">{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  if (!results) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm scale-in">
      <div className="flex items-center mb-4">
        <div className="bg-primary-50 p-2 rounded-full mr-3">
          <FiFileText className="text-primary-600 h-5 w-5" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Analysis Results</h2>
      </div>
      
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100 transition-all hover:border-primary-200">
        <h3 className="text-md font-medium text-gray-700 mb-2 flex items-center">
          <FiTag className="mr-2 text-primary-500" />
          Detected Job Title:
        </h3>
        <p className="text-lg font-semibold text-primary-700 pl-6">{results.title}</p>
      </div>
      
      {results.sections && (
        <div className="mb-4 bg-white rounded-lg border border-gray-200 transition-all duration-300 overflow-hidden">
          <div 
            className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer border-b border-gray-200 hover:bg-gray-100 transition-colors"
            onClick={() => setSectionsExpanded(!sectionsExpanded)}
          >
            <h3 className="text-md font-medium text-gray-700 flex items-center">
              <FiList className="mr-2 text-primary-500" />
              Extracted Sections
            </h3>
            {sectionsExpanded ? (
              <FiChevronUp className="text-gray-500" />
            ) : (
              <FiChevronDown className="text-gray-500" />
            )}
          </div>
          
          <div className={`overflow-hidden transition-all duration-300 ${
            sectionsExpanded ? 'max-h-[2000px] opacity-100 p-4' : 'max-h-0 opacity-0 p-0'
          }`}>
            {renderSection("Skills", results.sections.skills, "skills")}
            {renderSection("Experience", results.sections.experience, "experience")}
            {renderSection("Qualifications", results.sections.qualifications, "qualifications")}
            {renderSection("Responsibilities", results.sections.responsibilities, "responsibilities")}
            
            {visibleSections.length === 0 && (
              <p className="text-gray-500 italic">No sections were detected in this job description.</p>
            )}
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg border border-gray-200 transition-all duration-300 overflow-hidden">
        <div 
          className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer border-b border-gray-200 hover:bg-gray-100 transition-colors"
          onClick={() => setEmbeddingsExpanded(!embeddingsExpanded)}
        >
          <h3 className="text-md font-medium text-gray-700 flex items-center">
            <FiBarChart className="mr-2 text-primary-500" />
            Embedding Details
          </h3>
          {embeddingsExpanded ? (
            <FiChevronUp className="text-gray-500" />
          ) : (
            <FiChevronDown className="text-gray-500" />
          )}
        </div>
        
        <div className={`overflow-hidden transition-all duration-300 ${
          embeddingsExpanded ? 'max-h-96 opacity-100 p-4' : 'max-h-0 opacity-0 p-0'
        }`}>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-700">
                Vector Dimensions: <span className="font-semibold text-primary-700">
                  {typeof results.embedding === 'object' ? Object.keys(results.embedding).length : 
                   (results.embedding && results.embedding.length ? results.embedding.length : 'N/A')}
                </span>
              </p>
              <span className="bg-primary-100 text-primary-800 text-xs font-medium py-1 px-2 rounded-full">
                AI Model
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              These embeddings represent the semantic meaning of the job description, enabling 
              precise matching with candidate resumes based on qualifications and responsibilities.
            </p>
            
            <div className="mt-4 flex">
              <div className="mr-4 flex-grow">
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: '100%', animation: 'slideRight 1s ease-out' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Responsibilities</p>
              </div>
              <div className="flex-grow">
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: '100%', animation: 'slideRight 1s ease-out 0.2s' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Qualifications</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideRight {
          from { width: 0; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default ResultsDisplay;

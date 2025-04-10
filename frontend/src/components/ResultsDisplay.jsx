import React, { useState, useEffect } from 'react';
import { FiFileText, FiChevronDown, FiChevronUp, FiTag, FiList, FiBarChart, FiBookOpen } from 'react-icons/fi';

const ResultsDisplay = ({ results }) => {
  const [sectionsExpanded, setSectionsExpanded] = useState(true);
  const [embeddingsExpanded, setEmbeddingsExpanded] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(true);
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
        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <FiList className="mr-2 text-indigo-500" />
          {title}:
        </h3>
        <ul className="list-disc list-inside pl-2 space-y-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
          {items.map((item, index) => (
            <li key={index} className="text-gray-700 text-sm stagger-item">{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  if (!results) return null;

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm scale-in">
      <div className="flex items-center mb-4">
        <div className="bg-indigo-50 p-2 rounded-lg mr-3">
          <FiFileText className="text-indigo-600 h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Analysis Results</h2>
      </div>
      
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100 transition-all hover:border-indigo-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <FiTag className="mr-2 text-indigo-500" />
          Position Title:
        </h3>
        <p className="text-lg font-semibold text-indigo-700 pl-6">{results.title}</p>
      </div>
      
      {/* JD Summary Section */}
      {results.summary && (
        <div className="mb-4 bg-white rounded-lg border border-gray-200 transition-all duration-300 overflow-hidden">
          <div 
            className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer border-b border-gray-200 hover:bg-gray-100 transition-colors"
            onClick={() => setSummaryExpanded(!summaryExpanded)}
          >
            <h3 className="text-sm font-medium text-gray-700 flex items-center">
              <FiBookOpen className="mr-2 text-indigo-500" />
              Summary
            </h3>
            {summaryExpanded ? (
              <FiChevronUp className="text-gray-500" />
            ) : (
              <FiChevronDown className="text-gray-500" />
            )}
          </div>
          
          <div className={`overflow-hidden transition-all duration-300 ${
            summaryExpanded ? 'max-h-[2000px] opacity-100 p-4' : 'max-h-0 opacity-0 p-0'
          }`}>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                {results.summary}
              </pre>
            </div>
          </div>
        </div>
      )}
      
      {/* Key Requirements Section */}
      {results.sections && (
        <div className="mb-4 bg-white rounded-lg border border-gray-200 transition-all duration-300 overflow-hidden">
          <div 
            className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer border-b border-gray-200 hover:bg-gray-100 transition-colors"
            onClick={() => setSectionsExpanded(!sectionsExpanded)}
          >
            <h3 className="text-sm font-medium text-gray-700 flex items-center">
              <FiList className="mr-2 text-indigo-500" />
              Key Requirements
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
              <p className="text-gray-500 italic text-sm">No specific requirements were detected in this job description.</p>
            )}
          </div>
        </div>
      )}
      
      {/* Technical Details Section (Hidden by Default) */}
      <div className="bg-white rounded-lg border border-gray-200 transition-all duration-300 overflow-hidden">
        <div 
          className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer border-b border-gray-200 hover:bg-gray-100 transition-colors"
          onClick={() => setEmbeddingsExpanded(!embeddingsExpanded)}
        >
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <FiBarChart className="mr-2 text-indigo-500" />
            Technical Details
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
              <p className="text-gray-700 text-sm">
                Vector Dimensions: <span className="font-semibold text-indigo-700">
                  {typeof results.embedding === 'object' ? Object.keys(results.embedding).length : 
                   (results.embedding && results.embedding.length ? results.embedding.length : 'N/A')}
                </span>
              </p>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-medium py-1 px-2 rounded-full">
                AI Model
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              These embeddings represent the semantic meaning of the job description, enabling 
              precise matching with candidate resumes based on qualifications and responsibilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;

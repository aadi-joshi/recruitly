import React, { useState, useEffect } from 'react';
import { FiFileText, FiSearch } from 'react-icons/fi';

const JobDescriptionForm = ({ onSubmit, isLoading, savedData }) => {
  const [jobDescription, setJobDescription] = useState(() => {
    // Check if there's a saved job description in localStorage
    const savedJobDesc = localStorage.getItem('jobDescriptionText');
    return savedJobDesc || '';
  });
  const [charCount, setCharCount] = useState(() => {
    const savedJobDesc = localStorage.getItem('jobDescriptionText');
    return savedJobDesc ? savedJobDesc.length : 0;
  });

  // Update localStorage when job description changes
  useEffect(() => {
    if (jobDescription) {
      localStorage.setItem('jobDescriptionText', jobDescription);
    }
  }, [jobDescription]);

  const handleChange = (e) => {
    setJobDescription(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!jobDescription.trim()) {
      alert('Please enter a job description');
      return;
    }
    
    onSubmit(jobDescription);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center mb-4">
        <div className="bg-primary-50 p-2 rounded-full mr-3">
          <FiFileText className="text-primary-600 h-5 w-5" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Job Description Analysis</h2>
      </div>
      
      <p className="text-gray-600 mb-4 text-sm">
        Paste a job description below to analyze key requirements, responsibilities, and qualifications for matching.
        {savedData && (
          <span className="ml-1 text-primary-600">
            A job description has already been analyzed.
          </span>
        )}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="transition-all duration-300 focus-within:shadow-sm rounded-lg">
          <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Job Description:
          </label>
          <textarea
            id="jobDescription"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
            rows="10"
            value={jobDescription}
            onChange={handleChange}
            placeholder="Enter the job description text here..."
            required
            disabled={isLoading}
          ></textarea>
          <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
            <span>{charCount > 0 ? `${charCount} characters` : 'Enter your text'}</span>
            <span className={`${charCount > 100 ? 'text-green-600' : 'text-gray-500'}`}>
              {charCount > 100 ? 'Good length' : 'Minimum recommended: 100 characters'}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            type="submit"
            className={`btn flex-1 flex items-center justify-center transition-all ${
              isLoading 
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                : 'btn-primary hover:shadow'
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-pulse mr-2">Analyzing...</span>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
              </>
            ) : (
              <>
                <FiSearch className="mr-2" />
                {savedData ? 'Re-Analyze Description' : 'Analyze Job Description'}
              </>
            )}
          </button>
          
          {savedData && (
            <button
              type="button"
              onClick={() => window.location.href = "#step2"}
              className="btn bg-green-600 text-white hover:bg-green-700 px-4"
            >
              Continue to Next Step
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default JobDescriptionForm;

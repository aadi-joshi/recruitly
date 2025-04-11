import React, { useState, useEffect } from 'react';
import { FiFileText, FiSearch, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const JobDescriptionForm = ({ onSubmit, isLoading, savedData }) => {
  const navigate = useNavigate();
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
    <div className="bg-white p-5 rounded-lg shadow-sm">
      <div className="flex items-center mb-4">
        <div className="bg-indigo-50 p-2 rounded-lg mr-3">
          <FiFileText className="text-indigo-600 h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Job Description Analysis</h2>
      </div>
      
      <p className="text-gray-600 mb-4 text-sm">
        Paste a job description below to analyze its key requirements, responsibilities, and qualifications.
        {savedData && (
          <span className="ml-1 text-indigo-600">
            A job description has already been analyzed.
          </span>
        )}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="transition-all duration-300 focus-within:shadow-sm rounded-lg">
          <textarea
            id="jobDescription"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
            rows="8"
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
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {savedData && "Our AI agents will analyze the job description to extract key requirements."}
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className={`btn flex items-center justify-center ${
                isLoading 
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                  : 'btn-primary bg-indigo-600 hover:bg-indigo-700'
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="mr-2">Analyzing</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                </>
              ) : (
                <>
                  {savedData ? 'Re-analyze' : 'Analyze Job Description'}
                </>
              )}
            </button>
            
            {savedData && (
              <button
                type="button"
                onClick={() => navigate('/resume-upload')}
                className="btn flex items-center gap-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
              >
                <span>Continue</span>
                <FiArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default JobDescriptionForm;

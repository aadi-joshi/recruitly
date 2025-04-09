import React, { useState } from 'react';

const JobDescriptionForm = ({ onSubmit, isLoading }) => {
  const [jobDescription, setJobDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!jobDescription.trim()) {
      alert('Please enter a job description');
      return;
    }
    
    onSubmit(jobDescription);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Job Description Analysis</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Paste your job description:
          </label>
          <textarea
            id="jobDescription"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            rows="10"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Enter the job description text here..."
            required
            disabled={isLoading}
          ></textarea>
        </div>
        <button
          type="submit"
          className={`btn w-full ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'btn-primary'}`}
          disabled={isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Analyze Job Description'}
        </button>
      </form>
    </div>
  );
};

export default JobDescriptionForm;

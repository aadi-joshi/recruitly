import React, { useState } from 'react';
import { FiUpload, FiFile, FiX, FiCheckCircle } from 'react-icons/fi';

const ResumeUploader = ({ onUpload, isLoading }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;
    onUpload(selectedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(file => 
        file.type === 'application/pdf'
      );
      setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm">
      <div className="flex items-center mb-4">
        <div className="bg-indigo-50 p-2 rounded-lg mr-3">
          <FiUpload className="text-indigo-600 h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Resume Upload</h2>
      </div>
      
      <p className="text-gray-600 mb-4 text-sm">
        Upload candidate resumes to analyze their qualifications, skills, and experience.
      </p>
      
      <div className="mb-4">
        <label
          htmlFor="resume-upload"
          className={`block p-6 border-2 border-dashed rounded-lg cursor-pointer text-center transition-all duration-300 
            ${isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:bg-gray-50'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FiUpload className={`mx-auto h-7 w-7 mb-2 transition-all duration-300 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`} />
          <span className="block text-sm font-medium text-gray-700">
            Drag and drop resume files here
          </span>
          <span className="mt-1 block text-xs text-gray-500">
            PDF files only (you can select multiple files)
          </span>
          <span className="mt-3 inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
            or click to browse
          </span>
        </label>
        <input
          id="resume-upload"
          type="file"
          className="hidden"
          accept=".pdf"
          multiple
          onChange={handleFileChange}
        />
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="mb-4 scale-in">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              Selected Files
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {selectedFiles.length}
              </span>
            </h3>
          </div>
          <ul className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between py-2 px-3 text-sm border-b border-gray-100 last:border-b-0 stagger-item">
                <div className="flex items-center overflow-hidden">
                  <FiFile className="mr-2 text-indigo-500 flex-shrink-0" />
                  <span className="truncate max-w-md text-gray-700">{file.name}</span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors ml-2 flex-shrink-0"
                  disabled={isLoading}
                  title="Remove file"
                >
                  <FiX />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <button
        onClick={handleUpload}
        disabled={isLoading || selectedFiles.length === 0}
        className={`btn w-full flex items-center justify-center ${
          isLoading || selectedFiles.length === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
            <span>Processing Resumes...</span>
          </div>
        ) : (
          <>
            {selectedFiles.length > 0 ? <FiCheckCircle className="mr-2" /> : <FiUpload className="mr-2" />}
            {selectedFiles.length > 0 ? 'Process Resumes' : 'Select Files to Begin'}
          </>
        )}
      </button>
      
      {isLoading && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center">
            <div className="animate-pulse mr-2 text-blue-500">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-blue-700">
              Resume analysis in progress. This may take a moment as our AI agents extract skills and qualifications.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;

import React, { useState } from 'react';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';

const ResumeUploader = ({ onUpload, isLoading }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;
    onUpload(selectedFiles);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Resume Upload</h2>
      
      <div className="mb-4">
        <label
          htmlFor="resume-upload"
          className="block p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-center"
        >
          <FiUpload className="mx-auto h-8 w-8 text-gray-400" />
          <span className="mt-2 block text-sm font-medium text-gray-700">
            Click to upload resume PDFs
          </span>
          <span className="mt-1 block text-xs text-gray-500">
            PDF files only (you can select multiple files)
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
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Files ({selectedFiles.length}):</h3>
          <ul className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between py-2 px-3 text-sm border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <FiFile className="mr-2 text-gray-500" />
                  <span className="truncate max-w-md">{file.name}</span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-500 hover:text-red-500"
                  disabled={isLoading}
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
        className={`btn w-full ${
          isLoading || selectedFiles.length === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'btn-primary'
        }`}
      >
        {isLoading ? 'Processing...' : 'Process Resumes'}
      </button>
    </div>
  );
};

export default ResumeUploader;

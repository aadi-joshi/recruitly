import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';

// Set the PDF.js worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFUploader = ({ setPdfContents }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const extractTextFromPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const textItems = textContent.items.map(item => item.str);
        fullText += textItems.join(' ') + '\n';
      }
      
      return {
        name: file.name,
        text: fullText.trim(),
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return {
        name: file.name,
        text: 'Error extracting text from this PDF.',
        size: file.size,
        type: file.type,
        error: true
      };
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    
    try {
      const pdfDataPromises = selectedFiles.map(file => extractTextFromPDF(file));
      const pdfContents = await Promise.all(pdfDataPromises);
      
      setPdfContents(pdfContents);
    } catch (error) {
      console.error('Error processing PDF files:', error);
      alert('An error occurred while processing the PDF files.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card h-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">CV Analysis</h2>
      
      <div className="mb-4">
        <label
          htmlFor="pdf-upload"
          className="block p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-center"
        >
          <FiUpload className="mx-auto h-8 w-8 text-gray-400" />
          <span className="mt-2 block text-sm font-medium text-gray-700">
            Click to upload PDF CVs
          </span>
          <span className="mt-1 block text-xs text-gray-500">
            PDF files only
          </span>
        </label>
        <input
          id="pdf-upload"
          type="file"
          className="hidden"
          accept=".pdf"
          multiple
          onChange={handleFileChange}
        />
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h3>
          <ul className="max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between py-2 px-3 text-sm">
                <div className="flex items-center">
                  <FiFile className="mr-2 text-gray-500" />
                  <span className="truncate max-w-xs">{file.name}</span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <FiX />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <button
        onClick={processFiles}
        disabled={uploading || selectedFiles.length === 0}
        className={`btn ${
          uploading || selectedFiles.length === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'btn-primary'
        } w-full`}
      >
        {uploading ? 'Processing...' : 'Process CV Files'}
      </button>
    </div>
  );
};

export default PDFUploader;

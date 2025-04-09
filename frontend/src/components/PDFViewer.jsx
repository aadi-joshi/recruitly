import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const PDFViewer = ({ pdfContents }) => {
  const [expandedPdf, setExpandedPdf] = useState(null);

  const toggleExpand = (index) => {
    if (expandedPdf === index) {
      setExpandedPdf(null);
    } else {
      setExpandedPdf(index);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Extracted CV Text</h2>
      
      <div className="space-y-4">
        {pdfContents.map((pdf, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
              onClick={() => toggleExpand(index)}
            >
              <div>
                <h3 className="font-medium text-gray-800">{pdf.name}</h3>
                <p className="text-sm text-gray-500">{formatSize(pdf.size)}</p>
              </div>
              {expandedPdf === index ? (
                <FiChevronUp className="text-gray-500" />
              ) : (
                <FiChevronDown className="text-gray-500" />
              )}
            </div>
            
            {expandedPdf === index && (
              <div className="p-4 bg-white">
                {pdf.error ? (
                  <p className="text-red-500">{pdf.text}</p>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                      {pdf.text}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFViewer;

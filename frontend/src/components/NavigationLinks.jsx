import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiFileText, FiUpload, FiCheckSquare } from 'react-icons/fi';

const NavigationLinks = () => {
  const location = useLocation();
  
  const steps = [
    { id: 1, path: "/job-description", title: "Job Description", icon: FiFileText },
    { id: 2, path: "/resume-upload", title: "Resume Upload", icon: FiUpload },
    { id: 3, path: "/candidate-matching", title: "Candidate Matching", icon: FiCheckSquare },
  ];

  // Determine active step based on current path
  const getActiveStep = () => {
    const currentPath = location.pathname;
    const activeStep = steps.findIndex(step => step.path === currentPath) + 1;
    return activeStep > 0 ? activeStep : 1; // Default to first step if not found
  };

  const activeStep = getActiveStep();

  return (
    <div className="w-full py-3 mb-4">
      <div className="flex items-center">
        {steps.map((step, i) => (
          <React.Fragment key={step.id}>
            {/* Step circle */}
            <Link 
              to={step.path}
              className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ${
                activeStep >= step.id 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}
            >
              <step.icon className="w-4 h-4" />
            </Link>
            
            {/* Step title */}
            <div className="ml-2">
              <Link 
                to={step.path}
                className={`text-sm font-medium transition-colors duration-300 
                  ${activeStep >= step.id ? 'text-indigo-700' : 'text-gray-500'}`}
              >
                {step.title}
              </Link>
            </div>
            
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="relative flex-1 h-0.5 mx-3">
                <div className="absolute inset-0 bg-gray-200"></div>
                <div 
                  className="absolute inset-0 bg-indigo-500 transition-all duration-500 ease-in-out"
                  style={{ width: activeStep > i + 1 ? '100%' : activeStep === i + 1 ? '50%' : '0%' }}
                ></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default NavigationLinks;

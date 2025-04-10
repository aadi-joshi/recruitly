import React from 'react';
import { FiFileText, FiUpload, FiCheckSquare } from 'react-icons/fi';

const WorkflowSteps = ({ activeStep, setActiveStep }) => {
  const steps = [
    { id: 1, title: 'Job Description', icon: FiFileText },
    { id: 2, title: 'Resume Upload', icon: FiUpload },
    { id: 3, title: 'Candidate Matching', icon: FiCheckSquare },
  ];

  return (
    <div className="w-full py-3">
      <div className="flex items-center">
        {steps.map((step, i) => (
          <React.Fragment key={step.id}>
            {/* Step circle */}
            <div 
              className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ${
                activeStep >= step.id 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-400 border border-gray-200'
              } cursor-pointer`}
              onClick={() => {
                // Only allow going back or to steps we've completed+1
                if (step.id <= activeStep || step.id === activeStep + 1) {
                  setActiveStep(step.id);
                }
              }}
            >
              <step.icon className="w-4 h-4" />
            </div>
            
            {/* Step title */}
            <div className="ml-2">
              <div 
                className={`text-sm font-medium transition-colors duration-300 
                  ${activeStep >= step.id ? 'text-indigo-700' : 'text-gray-500'}`}
              >
                {step.title}
              </div>
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

export default WorkflowSteps;

import React from 'react';
import { FiFileText, FiUpload, FiCheckSquare } from 'react-icons/fi';

const WorkflowSteps = ({ activeStep, setActiveStep }) => {
  const steps = [
    { id: 1, title: 'Job Description', icon: FiFileText },
    { id: 2, title: 'Resume Upload', icon: FiUpload },
    { id: 3, title: 'Match Results', icon: FiCheckSquare },
  ];

  return (
    <div className="w-full py-6">
      <div className="flex items-center">
        {steps.map((step, i) => (
          <React.Fragment key={step.id}>
            {/* Step circle */}
            <div 
              className={`flex items-center justify-center w-10 h-10 rounded-full 
                ${activeStep >= step.id 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-600'} 
                transition-colors duration-200 cursor-pointer`}
              onClick={() => step.id < activeStep && setActiveStep(step.id)}
            >
              <step.icon className="w-5 h-5" />
            </div>
            
            {/* Step title */}
            <div className="ml-2">
              <div 
                className={`text-sm font-medium ${activeStep >= step.id ? 'text-primary-600' : 'text-gray-500'}`}
              >
                {step.title}
              </div>
            </div>
            
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div 
                className={`flex-1 h-0.5 mx-4 ${activeStep > i + 1 ? 'bg-primary-600' : 'bg-gray-200'}`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default WorkflowSteps;

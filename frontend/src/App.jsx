import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import JobDescriptionForm from './components/JobDescriptionForm';
import ResumeUploader from './components/ResumeUploader';
import ResultsDisplay from './components/ResultsDisplay';
import MatchingResults from './components/MatchingResults';
import WorkflowSteps from './components/WorkflowSteps';
import CustomEmailForm from './components/CustomEmailForm';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { FiMail } from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  // Initialize state from localStorage if available
  const [activeStep, setActiveStep] = useState(() => {
    const savedStep = localStorage.getItem('activeStep');
    return savedStep ? parseInt(savedStep, 10) : 1;
  });
  
  const [loading, setLoading] = useState(false);
  
  const [jdResults, setJdResults] = useState(() => {
    const savedResults = localStorage.getItem('jdResults');
    return savedResults ? JSON.parse(savedResults) : null;
  });
  
  const [resumeResults, setResumeResults] = useState(() => {
    const savedResults = localStorage.getItem('resumeResults');
    return savedResults ? JSON.parse(savedResults) : [];
  });
  
  const [matchResults, setMatchResults] = useState(() => {
    const savedResults = localStorage.getItem('matchResults');
    return savedResults ? JSON.parse(savedResults) : null;
  });

  // Animation state for page transitions
  const [animatingOut, setAnimatingOut] = useState(false);
  const [currentView, setCurrentView] = useState(() => {
    const savedStep = localStorage.getItem('activeStep');
    return savedStep ? parseInt(savedStep, 10) : 1;
  });

  const [customEmailModalOpen, setCustomEmailModalOpen] = useState(false);

  // Persist state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('activeStep', activeStep.toString());
  }, [activeStep]);

  useEffect(() => {
    if (jdResults) {
      localStorage.setItem('jdResults', JSON.stringify(jdResults));
    }
  }, [jdResults]);

  useEffect(() => {
    if (resumeResults.length > 0) {
      localStorage.setItem('resumeResults', JSON.stringify(resumeResults));
    }
  }, [resumeResults]);

  useEffect(() => {
    if (matchResults) {
      localStorage.setItem('matchResults', JSON.stringify(matchResults));
    }
  }, [matchResults]);

  useEffect(() => {
    if (activeStep !== currentView) {
      setAnimatingOut(true);
      const timeout = setTimeout(() => {
        setCurrentView(activeStep);
        setAnimatingOut(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [activeStep, currentView]);

  // Enhanced toast configuration
  const notifySuccess = (message) => toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    className: "toast-success",
  });

  const notifyError = (message) => toast.error(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    className: "toast-error",
  });

  const handleJdSubmit = async (jobDescription) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/embed', {
        text: jobDescription
      });
      setJdResults(response.data);
      notifySuccess('Job description successfully analyzed!');
      setActiveStep(2); // Move to resume upload step
    } catch (error) {
      console.error('Error analyzing job description:', error);
      notifyError('Error analyzing job description. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (files) => {
    if (files.length === 0) return;
    
    setLoading(true);
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    try {
      const response = await axios.post('/api/upload-resumes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const results = response.data;
      const processedResumes = Object.keys(results).map(filename => ({
        name: filename,
        ...results[filename]
      }));
      
      setResumeResults(processedResumes);
      notifySuccess(`Successfully processed ${processedResumes.length} resumes!`);
      setActiveStep(3); // Move to matching step
      
    } catch (error) {
      console.error('Error processing resumes:', error);
      notifyError('Error processing resumes. Please check if files are valid PDFs.');
    } finally {
      setLoading(false);
    }
  };

  const handleMatching = async () => {
    if (!jdResults || resumeResults.length === 0) {
      toast.warning('Please complete both job description analysis and resume upload first.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Only make the API call if we don't already have match results
      if (!matchResults) {
        const response = await axios.post('/api/match');
        setMatchResults(response.data);
        notifySuccess('Matching completed successfully!');
      }
      setActiveStep(3); // Move to matching step
    } catch (error) {
      console.error('Error during matching:', error);
      notifyError('Error during matching process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetWorkflow = async () => {
    try {
      await axios.get('/api/clear-session');
      setJdResults(null);
      setResumeResults([]);
      setMatchResults(null);
      setActiveStep(1);
      
      // Clear localStorage
      localStorage.removeItem('jdResults');
      localStorage.removeItem('resumeResults');
      localStorage.removeItem('matchResults');
      localStorage.removeItem('activeStep');
      
      toast.info('Workflow reset. You can start a new session.');
    } catch (error) {
      console.error('Error resetting workflow:', error);
      notifyError('Error resetting workflow.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        limit={3}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center">
          <WorkflowSteps activeStep={activeStep} setActiveStep={setActiveStep} />
          
          <button
            onClick={() => setCustomEmailModalOpen(true)}
            className="btn-primary btn flex items-center"
          >
            <FiMail className="mr-2" />
            <span>Send Custom Email</span>
          </button>
        </div>
        
        <div className={`mt-8 transition-opacity duration-300 ${animatingOut ? 'opacity-0' : 'opacity-100'}`}>
          {/* Step 1: Job Description Analysis */}
          {currentView === 1 && (
            <div className="slide-up">
              <JobDescriptionForm onSubmit={handleJdSubmit} isLoading={loading} savedData={jdResults} />
              {jdResults && (
                <div className="mt-6 scale-in">
                  <ResultsDisplay results={jdResults} />
                </div>
              )}
            </div>
          )}
          
          {/* Step 2: Resume Upload */}
          {currentView === 2 && (
            <div className="slide-up">
              <ResumeUploader onUpload={handleResumeUpload} isLoading={loading} />
              {resumeResults.length > 0 && (
                <div className="mt-6 bg-white p-4 rounded-lg shadow-sm scale-in">
                  <h2 className="text-xl font-semibold mb-2">Processed Resumes</h2>
                  <p className="text-gray-700">
                    Successfully processed {resumeResults.length} resumes. You can now proceed to matching.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Step 3: Matching */}
          {currentView === 3 && (
            <div className="slide-up">
              <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h2 className="text-xl font-semibold mb-4">Resume Matching</h2>
                <p className="mb-4 text-gray-700">
                  {matchResults ? 'Match results are shown below.' : 'Click the button below to match the job description with the uploaded resumes.'}
                </p>
                {!matchResults && (
                  <button 
                    onClick={handleMatching}
                    disabled={loading}
                    className={`btn ${loading ? 'bg-gray-400' : 'btn-primary'} w-full relative overflow-hidden`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <span className="mr-2">Processing</span>
                        <span className="inline-flex h-2 w-2 bg-white rounded-full mr-1 opacity-75 animate-ping"></span>
                        <span className="inline-flex h-2 w-2 bg-white rounded-full mr-1 opacity-75 animate-ping" style={{ animationDelay: '0.2s' }}></span>
                        <span className="inline-flex h-2 w-2 bg-white rounded-full opacity-75 animate-ping" style={{ animationDelay: '0.4s' }}></span>
                      </span>
                    ) : 'Match Resumes'}
                  </button>
                )}
              </div>
              
              {matchResults && (
                <div className="scale-in">
                  <MatchingResults results={matchResults} />
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center fade-in">
          <button 
            onClick={resetWorkflow}
            className="btn bg-gray-700 text-white hover:bg-gray-800 px-6"
          >
            Reset Workflow
          </button>
        </div>
        
        {/* Custom Email Form */}
        <CustomEmailForm 
          isOpen={customEmailModalOpen}
          onClose={() => setCustomEmailModalOpen(false)}
        />
      </div>
      
      <footer className="bg-white border-t border-gray-200 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          Recruitly &copy; {new Date().getFullYear()} | AI-Powered Job Application Screening System
        </div>
      </footer>
    </div>
  );
}

export default App;

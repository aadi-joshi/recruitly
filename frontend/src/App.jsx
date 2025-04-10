import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import JobDescriptionForm from './components/JobDescriptionForm';
import ResumeUploader from './components/ResumeUploader';
import ResultsDisplay from './components/ResultsDisplay';
import MatchingResults from './components/MatchingResults';
import WorkflowSteps from './components/WorkflowSteps';
import CustomEmailForm from './components/CustomEmailForm';
import DashboardOverview from './components/DashboardOverview';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { FiMail, FiRefreshCw } from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';

function App() {
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

  const [animatingOut, setAnimatingOut] = useState(false);
  const [currentView, setCurrentView] = useState(() => {
    const savedStep = localStorage.getItem('activeStep');
    return savedStep ? parseInt(savedStep, 10) : 1;
  });

  const [customEmailModalOpen, setCustomEmailModalOpen] = useState(false);

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
      setActiveStep(2);
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
      setActiveStep(3);

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
      if (!matchResults) {
        const response = await axios.post('/api/match');
        setMatchResults(response.data);
        notifySuccess('Matching completed successfully!');
      }
      setActiveStep(3);
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        limit={3}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 flex-grow max-w-6xl">
        <WorkflowSteps activeStep={activeStep} setActiveStep={setActiveStep} />
        
        {(jdResults || resumeResults.length > 0 || matchResults) && (
          <div className="mt-6">
            <DashboardOverview 
              jdResults={jdResults} 
              resumeResults={resumeResults}
              matchResults={matchResults}
            />
          </div>
        )}
        
        <div className={`mt-6 transition-opacity duration-300 ${animatingOut ? 'opacity-0' : 'opacity-100'}`}>
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
          
          {currentView === 2 && (
            <div className="slide-up">
              <ResumeUploader onUpload={handleResumeUpload} isLoading={loading} />
              {resumeResults.length > 0 && (
                <div className="mt-6 bg-white p-5 rounded-lg shadow-sm scale-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold mb-1">Resume Processing Complete</h2>
                      <p className="text-gray-600">
                        {resumeResults.length} {resumeResults.length === 1 ? 'resume' : 'resumes'} successfully processed
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveStep(3)}
                      className="btn-primary btn"
                    >
                      Continue to Matching
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {currentView === 3 && (
            <div className="slide-up">
              {!matchResults ? (
                <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                  <h2 className="text-xl font-semibold mb-3">Resume Matching</h2>
                  <p className="mb-4 text-gray-600">
                    Our AI agents will analyze each resume and match it against the job requirements.
                  </p>
                  <button 
                    onClick={handleMatching}
                    disabled={loading}
                    className={`btn ${loading ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'btn-primary'} w-full max-w-md mx-auto block`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <span className="mr-2">Processing</span>
                        <span className="inline-flex h-2 w-2 bg-white rounded-full mr-1 opacity-75 animate-ping"></span>
                        <span className="inline-flex h-2 w-2 bg-white rounded-full mr-1 opacity-75 animate-ping" style={{ animationDelay: '0.2s' }}></span>
                        <span className="inline-flex h-2 w-2 bg-white rounded-full opacity-75 animate-ping" style={{ animationDelay: '0.4s' }}></span>
                      </span>
                    ) : 'Start Matching Process'}
                  </button>
                </div>
              ) : (
                <div className="scale-in">
                  <MatchingResults results={matchResults} />
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-8 flex justify-center">
          <button 
            onClick={resetWorkflow}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
          >
            <FiRefreshCw className="h-4 w-4" />
            <span>Reset Session</span>
          </button>
        </div>
        
        <CustomEmailForm 
          isOpen={customEmailModalOpen}
          onClose={() => setCustomEmailModalOpen(false)}
        />
      </div>
      
      <footer className="bg-white border-t border-gray-200 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm max-w-6xl">
          <span className="font-medium text-gray-700">RecruitAI</span> &copy; {new Date().getFullYear()} | AI-Powered Recruitment Platform
        </div>
      </footer>
    </div>
  );
}

export default App;

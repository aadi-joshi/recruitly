import React, { useState } from 'react';
import Navbar from './components/Navbar';
import JobDescriptionForm from './components/JobDescriptionForm';
import ResumeUploader from './components/ResumeUploader';
import ResultsDisplay from './components/ResultsDisplay';
import MatchingResults from './components/MatchingResults';
import WorkflowSteps from './components/WorkflowSteps';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [jdResults, setJdResults] = useState(null);
  const [resumeResults, setResumeResults] = useState([]);
  const [matchResults, setMatchResults] = useState(null);

  const handleJdSubmit = async (jobDescription) => {
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/embed', {
        text: jobDescription
      });
      setJdResults(response.data);
      toast.success('Job description successfully analyzed!');
      setActiveStep(2); // Move to resume upload step
    } catch (error) {
      console.error('Error analyzing job description:', error);
      toast.error('Error analyzing job description. Please check if the backend server is running.');
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
      const response = await axios.post('http://127.0.0.1:8000/upload-resumes', formData, {
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
      toast.success(`Successfully processed ${processedResumes.length} resumes!`);
      setActiveStep(3); // Move to matching step
      
    } catch (error) {
      console.error('Error processing resumes:', error);
      toast.error('Error processing resumes. Please check if files are valid PDFs.');
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
      const response = await axios.post('http://127.0.0.1:8000/match');
      setMatchResults(response.data);
      toast.success('Matching completed successfully!');
    } catch (error) {
      console.error('Error during matching:', error);
      toast.error('Error during matching process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetWorkflow = async () => {
    try {
      await axios.get('http://127.0.0.1:8000/clear-session');
      setJdResults(null);
      setResumeResults([]);
      setMatchResults(null);
      setActiveStep(1);
      toast.info('Workflow reset. You can start a new session.');
    } catch (error) {
      console.error('Error resetting workflow:', error);
      toast.error('Error resetting workflow.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <WorkflowSteps activeStep={activeStep} setActiveStep={setActiveStep} />
        
        <div className="mt-8">
          {/* Step 1: Job Description Analysis */}
          <div className={activeStep === 1 ? 'block' : 'hidden'}>
            <JobDescriptionForm onSubmit={handleJdSubmit} isLoading={loading} />
            {jdResults && (
              <div className="mt-6">
                <ResultsDisplay results={jdResults} />
              </div>
            )}
          </div>
          
          {/* Step 2: Resume Upload */}
          <div className={activeStep === 2 ? 'block' : 'hidden'}>
            <ResumeUploader onUpload={handleResumeUpload} isLoading={loading} />
            {resumeResults.length > 0 && (
              <div className="mt-6 bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-2">Processed Resumes</h2>
                <p className="text-gray-700">
                  Successfully processed {resumeResults.length} resumes. You can now proceed to matching.
                </p>
              </div>
            )}
          </div>
          
          {/* Step 3: Matching */}
          <div className={activeStep === 3 ? 'block' : 'hidden'}>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Resume Matching</h2>
              <p className="mb-4 text-gray-700">
                Click the button below to match the job description with the uploaded resumes.
              </p>
              <button 
                onClick={handleMatching}
                disabled={loading}
                className={`btn ${loading ? 'bg-gray-400' : 'btn-primary'} w-full`}
              >
                {loading ? 'Processing...' : 'Match Resumes'}
              </button>
            </div>
            
            {matchResults && (
              <div className="mt-6">
                <MatchingResults results={matchResults} />
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button 
            onClick={resetWorkflow}
            className="btn bg-gray-700 text-white hover:bg-gray-800"
          >
            Reset Workflow
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

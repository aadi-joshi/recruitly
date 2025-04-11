import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import NavigationLinks from "./components/NavigationLinks";
import JobDescriptionPage from "./pages/JobDescriptionPage";
import ResumeUploadPage from "./pages/ResumeUploadPage";
import CandidateMatchingPage from "./pages/CandidateMatchingPage";
import DashboardOverview from "./components/DashboardOverview";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { FiRefreshCw } from "react-icons/fi";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [loading, setLoading] = useState(false);

  const [jdResults, setJdResults] = useState(() => {
    const savedResults = localStorage.getItem("jdResults");
    return savedResults ? JSON.parse(savedResults) : null;
  });

  const [resumeResults, setResumeResults] = useState(() => {
    const savedResults = localStorage.getItem("resumeResults");
    return savedResults ? JSON.parse(savedResults) : [];
  });

  const [matchResults, setMatchResults] = useState(() => {
    const savedResults = localStorage.getItem("matchResults");
    return savedResults ? JSON.parse(savedResults) : null;
  });

  useEffect(() => {
    if (jdResults) {
      localStorage.setItem("jdResults", JSON.stringify(jdResults));
    }
  }, [jdResults]);

  useEffect(() => {
    if (resumeResults.length > 0) {
      localStorage.setItem("resumeResults", JSON.stringify(resumeResults));
    }
  }, [resumeResults]);

  useEffect(() => {
    if (matchResults) {
      localStorage.setItem("matchResults", JSON.stringify(matchResults));
    }
  }, [matchResults]);

  const notifySuccess = (message) =>
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      className: "toast-success",
    });

  const notifyError = (message) =>
    toast.error(message, {
      position: "top-right",
      autoClose: 4000,
      className: "toast-error",
    });

  const handleJdSubmit = async (jobDescription) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/embed", {
        text: jobDescription,
      });
      setJdResults(response.data);
      notifySuccess("Job description successfully analyzed!");
    } catch (error) {
      console.error("Error analyzing job description:", error);
      notifyError("Error analyzing job description. Please check backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (files) => {
    if (files.length === 0) return;
    setLoading(true);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    try {
      const response = await axios.post("/api/upload-resumes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const results = response.data;
      const processedResumes = Object.keys(results).map((filename) => ({
        name: filename,
        ...results[filename],
      }));
      setResumeResults(processedResumes);
      notifySuccess(`Successfully processed ${processedResumes.length} resumes!`);
    } catch (error) {
      console.error("Error processing resumes:", error);
      notifyError("Error processing resumes. Check if files are valid PDFs.");
    } finally {
      setLoading(false);
    }
  };

  const handleMatching = async () => {
    if (!jdResults || resumeResults.length === 0) {
      toast.warning("Please complete both job description analysis and resume upload first.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("/api/match");
      setMatchResults(response.data); // Update matchResults
      notifySuccess("Matching completed successfully!");
    } catch (error) {
      console.error("Error during matching:", error);
      notifyError("Error during matching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetWorkflow = async () => {
    try {
      await axios.get("/api/clear-session");
      setJdResults(null);
      setResumeResults([]);
      setMatchResults(null);
      localStorage.removeItem("jdResults");
      localStorage.removeItem("resumeResults");
      localStorage.removeItem("matchResults");
      toast.info("Workflow reset. You can start a new session.");
    } catch (error) {
      console.error("Error resetting workflow:", error);
      notifyError("Error resetting workflow.");
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <ToastContainer position="top-right" autoClose={3000} limit={3} />
        <Navbar />
        <div className="container mx-auto px-4 py-6 flex-grow max-w-6xl">
          <NavigationLinks />
          { (jdResults || resumeResults.length > 0 || matchResults) && (
            <div className="mt-6">
              <DashboardOverview jdResults={jdResults} resumeResults={resumeResults} matchResults={matchResults} />
            </div>
          )}
          <Routes>
            <Route
              path="/job-description"
              element={
                <JobDescriptionPage onSubmit={handleJdSubmit} isLoading={loading} jdResults={jdResults} />
              }
            />
            <Route
              path="/resume-upload"
              element={
                <ResumeUploadPage onUpload={handleResumeUpload} isLoading={loading} resumeResults={resumeResults} />
              }
            />
            <Route
              path="/candidate-matching"
              element={
                <CandidateMatchingPage matchResults={matchResults} handleMatching={handleMatching} isLoading={loading} />
              }
            />
            <Route path="*" element={<Navigate to="/job-description" replace />} />
          </Routes>
          <div className="mt-8 flex justify-center">
            <button
              onClick={resetWorkflow}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
            >
              <FiRefreshCw className="h-4 w-4" />
              <span>Reset Session</span>
            </button>
          </div>
        </div>
        <footer className="bg-white border-t border-gray-200 py-4 mt-8">
          <div className="container mx-auto px-4 text-center text-gray-500 text-sm max-w-6xl">
            <span className="font-medium text-gray-700">Recruitly</span> &copy; {new Date().getFullYear()} | AI-Powered Recruitment
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;

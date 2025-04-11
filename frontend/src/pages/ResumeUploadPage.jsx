import React from "react";
import ResumeUploader from "../components/ResumeUploader";
import { useNavigate } from "react-router-dom";

const ResumeUploadPage = ({ onUpload, isLoading, resumeResults }) => {
  const navigate = useNavigate();
  return (
    <div>
      <ResumeUploader onUpload={onUpload} isLoading={isLoading} />
      {resumeResults.length > 0 && (
        <div className="mt-6 bg-white p-5 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Resume Processing Complete</h2>
              <p className="text-gray-600">
                {resumeResults.length} {resumeResults.length === 1 ? "resume" : "resumes"} successfully processed
              </p>
            </div>
            <button onClick={() => navigate("/candidate-matching")} className="btn-primary btn">
              Continue to Matching
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUploadPage;

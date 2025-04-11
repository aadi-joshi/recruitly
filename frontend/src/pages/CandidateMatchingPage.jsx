import React from "react";
import MatchingResults from "../components/MatchingResults";

const CandidateMatchingPage = ({ matchResults, handleMatching, isLoading }) => {
  return (
    <div>
      {matchResults ? (
        <div className="mt-6">
          <MatchingResults results={matchResults} />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-3">Resume Matching</h2>
          <p className="mb-4 text-gray-600">
            Our AI agents will analyze each resume and match it against the job requirements.
          </p>
          <button 
            onClick={handleMatching}
            disabled={isLoading}
            className={`btn ${isLoading ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'btn-primary'} w-full max-w-md mx-auto block`}
          >
            {isLoading ? 'Processing...' : 'Start Matching Process'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CandidateMatchingPage;

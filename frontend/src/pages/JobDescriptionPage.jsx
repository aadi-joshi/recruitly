import React from "react";
import JobDescriptionForm from "../components/JobDescriptionForm";
import ResultsDisplay from "../components/ResultsDisplay";

const JobDescriptionPage = ({ onSubmit, isLoading, jdResults }) => {
  return (
    <div>
      <JobDescriptionForm onSubmit={onSubmit} isLoading={isLoading} savedData={jdResults} />
      {jdResults && (
        <div className="mt-6">
          <ResultsDisplay results={jdResults} />
        </div>
      )}
    </div>
  );
};

export default JobDescriptionPage;

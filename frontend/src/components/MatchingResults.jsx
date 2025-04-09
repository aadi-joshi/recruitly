import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiCheck, FiX } from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MatchingResults = ({ results }) => {
  const [expandedResult, setExpandedResult] = useState(null);
  
  if (!results || !results.matches || results.matches.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Matching Results</h2>
        <p className="text-gray-700">No matches found. Try uploading different resumes.</p>
      </div>
    );
  }
  
  // Count how many are matched vs not matched
  const matchedCount = results.matches.filter(m => m.isMatch).length;
  const totalCount = results.matches.length;
  
  // Sort results - matched first, then by score
  const sortedMatches = [...results.matches].sort((a, b) => {
    if (a.isMatch !== b.isMatch) return b.isMatch ? 1 : -1;
    return b.score - a.score;
  });

  const toggleExpand = (index) => {
    if (expandedResult === index) {
      setExpandedResult(null);
    } else {
      setExpandedResult(index);
    }
  };
  
  // Extract reasoning data for chart
  const getChartData = (reasoning) => {
    // Extract category and score from reasoning strings like "Skills: 78.5% match"
    const data = reasoning.map(item => {
      const [category, scoreText] = item.split(':');
      if (scoreText.includes('%')) {
        const scoreValue = parseFloat(scoreText.trim().split('%')[0]);
        return { category, score: scoreValue };
      } else {
        return { category, score: 0 };
      }
    });
    
    return {
      labels: data.map(d => d.category),
      datasets: [
        {
          label: 'Match Score (%)',
          data: data.map(d => d.score),
          backgroundColor: 'rgba(59, 58, 237, 0.7)',
          borderColor: 'rgba(59, 58, 237, 1)',
          borderWidth: 1,
        },
      ],
    };
  };
  
  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Match Percentage'
        }
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Matching Results</h2>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-md font-medium text-gray-700 mb-2">Summary:</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Total Resumes: <span className="font-semibold">{totalCount}</span></p>
            <p className="text-gray-600">Matched Candidates: <span className="font-semibold text-green-600">{matchedCount}</span></p>
          </div>
          <div className="text-3xl font-bold text-primary-600">
            {Math.round((matchedCount / totalCount) * 100)}%
            <span className="text-sm text-gray-500 block text-center">Match Rate</span>
          </div>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mb-3">Candidate Results:</h3>
      <div className="space-y-4">
        {sortedMatches.map((match, index) => (
          <div key={index} className={`border ${match.isMatch ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'} rounded-lg overflow-hidden`}>
            <div 
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => toggleExpand(index)}
            >
              <div className="flex items-center">
                <div className={`mr-3 p-1 rounded-full ${match.isMatch ? 'bg-green-500' : 'bg-gray-400'}`}>
                  {match.isMatch ? (
                    <FiCheck className="text-white" />
                  ) : (
                    <FiX className="text-white" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium">{match.name}</h4>
                  <p className="text-sm text-gray-500">{match.filename}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="mr-4">
                  <span className={`font-bold text-lg ${match.isMatch ? 'text-green-600' : 'text-gray-600'}`}>
                    {Math.round(match.score * 100)}%
                  </span>
                </div>
                {expandedResult === index ? (
                  <FiChevronUp className="text-gray-500" />
                ) : (
                  <FiChevronDown className="text-gray-500" />
                )}
              </div>
            </div>
            
            {expandedResult === index && (
              <div className="p-4 border-t border-gray-200 bg-white">
                <h5 className="font-medium mb-3">Match Details:</h5>
                <div className="mb-4">
                  <ul className="space-y-1">
                    {match.reasoning.map((reason, i) => (
                      <li key={i} className="text-gray-600">{reason}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="h-60 mt-4">
                  <Bar 
                    data={getChartData(match.reasoning)} 
                    options={chartOptions}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchingResults;

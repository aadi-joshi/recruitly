import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiCheck, FiX, FiUser, FiBarChart2, FiFile, FiMail } from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import EmailModal from './EmailModal';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MatchingResults = ({ results }) => {
  const [expandedResult, setExpandedResult] = useState(null);
  const [chartData, setChartData] = useState({});
  const [animatedMatches, setAnimatedMatches] = useState([]);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  useEffect(() => {
    if (results && results.matches) {
      // Clear existing matches first to prevent duplication
      setAnimatedMatches([]);
      
      // Animate matches appearing one by one
      const matches = [...results.matches].sort((a, b) => b.score - a.score);
      
      matches.forEach((match, index) => {
        setTimeout(() => {
          setAnimatedMatches(prev => [...prev, match]);
        }, 150 * index);
      });
    }
  }, [results]);
  
  // Debug: Log matches to check for duplicates
  useEffect(() => {
    if (results && results.matches) {
      console.log('Match data:', results.matches);
    }
  }, [results]);
  
  const handleEmailCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setEmailModalOpen(true);
  };
  
  if (!results || !results.matches || results.matches.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm scale-in">
        <div className="flex items-center mb-4">
          <div className="bg-gray-100 p-2 rounded-full mr-3">
            <FiBarChart2 className="text-gray-500 h-5 w-5" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Matching Results</h2>
        </div>
        <p className="text-gray-700">No matches found. Try uploading different resumes.</p>
      </div>
    );
  }
  
  // Count how many are matched vs not matched
  const matchedCount = results.matches.filter(m => m.isMatch).length;
  const totalCount = results.matches.length;
  
  // Extract reasoning data for chart
  const getChartData = (reasoning) => {
    // Extract category and score from reasoning strings
    const data = reasoning.map(item => {
      const [category, scoreText] = item.split(':');
      if (scoreText && scoreText.includes('%')) {
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
          backgroundColor: 'rgba(79, 92, 249, 0.7)',
          borderColor: 'rgba(79, 92, 249, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  };
  
  const toggleExpand = (index) => {
    if (expandedResult === index) {
      setExpandedResult(null);
    } else {
      setExpandedResult(index);
      
      // Prepare chart data when expanding
      const match = animatedMatches[index];
      if (match) {
        setChartData(getChartData(match.reasoning));
      }
    }
  };
  
  const chartOptions = {
    responsive: true,
    animation: {
      duration: 800,
      easing: 'easeOutQuart'
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          display: true,
          drawBorder: false,
          color: 'rgba(226, 232, 240, 0.7)'
        },
        ticks: {
          padding: 10,
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1a202c',
        bodyColor: '#4a5568',
        borderColor: 'rgba(226, 232, 240, 1)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        bodyFont: {
          size: 12
        },
        titleFont: {
          size: 13,
          weight: 'bold'
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm slide-up">
      <div className="flex items-center mb-4">
        <div className="bg-primary-50 p-2 rounded-full mr-3">
          <FiBarChart2 className="text-primary-600 h-5 w-5" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Matching Results</h2>
      </div>
      
      <div className="mb-6 p-5 bg-gray-50 rounded-lg border border-gray-100 scale-in">
        <h3 className="text-md font-medium text-gray-700 mb-3">Results Summary</h3>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-gray-600">Total Resumes: <span className="font-semibold">{totalCount}</span></p>
            <p className="text-gray-600">Matched Candidates: <span className="font-semibold text-green-600">{matchedCount}</span></p>
          </div>
          <div className="text-center">
            <div className="relative">
              <svg className="w-20 h-20">
                <circle 
                  cx="40" 
                  cy="40" 
                  r="36" 
                  fill="none" 
                  stroke="#e5e7eb" 
                  strokeWidth="8"
                />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="36" 
                  fill="none" 
                  stroke="#4f5cf9" 
                  strokeWidth="8"
                  strokeDasharray={`${matchedCount / totalCount * 226} 226`}
                  strokeDashoffset="0"
                  transform="rotate(-90 40 40)"
                  className="transition-all duration-1000 ease-out"
                  style={{ strokeDasharray: `${Math.round((matchedCount / totalCount) * 226)} 226` }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-2xl font-bold text-primary-600">
                  {Math.round((matchedCount / totalCount) * 100)}%
                </div>
              </div>
            </div>
            <span className="text-sm text-gray-500 block mt-1">Match Rate</span>
          </div>
        </div>
      </div>
      
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <FiUser className="mr-2 text-gray-500" />
        <span>Candidate Results</span>
      </h3>
      <div className="space-y-3">
        {animatedMatches.map((match, index) => (
          <div 
            key={index} 
            className={`border rounded-lg overflow-hidden transition-all duration-300 stagger-item
              ${match.isMatch 
                ? 'border-green-200 bg-green-50 hover:shadow' 
                : 'border-gray-200 bg-gray-50 hover:shadow'}`}
          >
            <div 
              className="flex items-center justify-between p-4 cursor-pointer transition-all hover:bg-opacity-80"
              onClick={() => toggleExpand(index)}
            >
              <div className="flex items-center overflow-hidden">
                <div className={`mr-3 p-1.5 rounded-full flex-shrink-0
                  ${match.isMatch ? 'bg-green-500' : 'bg-gray-400'}`}>
                  {match.isMatch ? (
                    <FiCheck className="text-white h-4 w-4" />
                  ) : (
                    <FiX className="text-white h-4 w-4" />
                  )}
                </div>
                <div className="overflow-hidden flex items-center">
                  <h4 className="font-medium text-gray-800 truncate">
                    {match.name}
                  </h4>
                  
                  {/* Email button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEmailCandidate(match);
                    }}
                    className="ml-2 p-1.5 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                    title="Email Candidate"
                  >
                    <FiMail size={16} />
                  </button>
                  
                  {match.filename && (
                    <div className="flex items-center text-xs text-gray-500 ml-3">
                      <FiFile className="mr-1 h-3 w-3" />
                      <span className="truncate">{match.filename}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="mr-4">
                  <div className="group relative">
                    <div className={`font-bold text-lg transition-all
                      ${match.isMatch ? 'text-green-600' : 'text-gray-600'}`}>
                      {Math.round(match.score * 100)}%
                    </div>
                    <div className="absolute top-full right-0 mt-1 w-24 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Match score
                    </div>
                  </div>
                </div>
                <div className="transition-transform duration-200">
                  {expandedResult === index ? (
                    <FiChevronUp className="text-gray-500" />
                  ) : (
                    <FiChevronDown className="text-gray-500" />
                  )}
                </div>
              </div>
            </div>
            
            {expandedResult === index && (
              <div className="p-4 border-t border-gray-200 bg-white scale-in">
                <h5 className="font-medium mb-3 text-gray-700">Match Details:</h5>
                <div className="mb-4">
                  <ul className="space-y-1">
                    {match.reasoning.map((reason, i) => (
                      <li key={i} className="text-gray-600 flex items-start py-1 stagger-item">
                        <span className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5">
                          {reason.includes("Strong") ? (
                            <span className="text-green-500">✓</span>
                          ) : reason.includes("Partial") ? (
                            <span className="text-yellow-500">⚠</span>
                          ) : (
                            <span className="text-red-500">✗</span>
                          )}
                        </span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="h-60 mt-6 p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <Bar 
                    data={chartData} 
                    options={chartOptions}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Email Modal */}
      <EmailModal 
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        candidateName={selectedCandidate?.name || ''}
        candidateEmail={`${selectedCandidate?.name?.toLowerCase().replace(/\s+/g, '.')}@example.com`}
      />
    </div>
  );
};

export default MatchingResults;

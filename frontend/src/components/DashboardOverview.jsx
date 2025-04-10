import React from 'react';
import { FiUsers, FiCheckSquare, FiFile, FiBarChart } from 'react-icons/fi';

const DashboardOverview = ({ jdResults, resumeResults, matchResults }) => {
  // Calculate stats
  const totalResumes = resumeResults?.length || 0;
  const matchedCandidates = matchResults?.matches?.filter(m => m.isMatch)?.length || 0;
  const matchPercentage = totalResumes > 0 ? Math.round((matchedCandidates / totalResumes) * 100) : 0;
  
  const stats = [
    {
      id: 'resumes',
      title: 'Resumes Analyzed',
      value: totalResumes,
      icon: FiFile,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      id: 'matched',
      title: 'Qualified Candidates',
      value: matchedCandidates,
      icon: FiCheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'match-rate',
      title: 'Match Rate',
      value: `${matchPercentage}%`,
      icon: FiBarChart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.id} className="flex items-center p-3 rounded-lg border border-gray-100">
            <div className={`${stat.bgColor} p-3 rounded-lg mr-3`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      {jdResults && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="font-medium text-gray-700 mb-2 text-sm">Current Job Position: <span className="text-indigo-600 font-semibold">{jdResults.title}</span></h3>
          <div className="flex flex-wrap gap-2">
            {jdResults.sections?.qualifications?.slice(0, 3).map((qual, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs">
                {qual.length > 40 ? qual.substring(0, 40) + '...' : qual}
              </span>
            ))}
            {jdResults.sections?.qualifications?.length > 3 && (
              <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs">
                +{jdResults.sections.qualifications.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;

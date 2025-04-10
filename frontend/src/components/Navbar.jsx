import React from 'react';
import { FiBriefcase, FiUsers, FiBarChart2 } from 'react-icons/fi';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-primary-600 p-2 rounded-lg mr-2 shadow-sm">
              <FiBriefcase className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
              <span className="text-primary-600">Recruitly</span>
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="flex items-center text-gray-600 hover:text-primary-600 transition-colors">
              <FiUsers className="mr-1" />
              <span className="hidden md:inline font-medium">Candidates</span>
            </a>
            <a href="#" className="flex items-center text-gray-600 hover:text-primary-600 transition-colors">
              <FiBarChart2 className="mr-1" />
              <span className="hidden md:inline font-medium">Analytics</span>
            </a>
            <div className="relative">
              <span className="bg-primary-50 text-primary-700 py-1 px-3 rounded-full text-sm font-medium border border-primary-100">
                Recruiter Portal
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

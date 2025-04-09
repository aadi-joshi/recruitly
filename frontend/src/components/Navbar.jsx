import React from 'react';
import { FiBriefcase, FiUsers } from 'react-icons/fi';

const Navbar = () => {
  return (
    <nav className="bg-primary-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FiBriefcase className="mr-2 h-6 w-6" />
            <h1 className="text-xl md:text-2xl font-bold">Resume Match Pro</h1>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="flex items-center hover:text-primary-200">
              <FiUsers className="mr-1" />
              <span className="hidden md:inline">Candidates</span>
            </a>
            <div className="relative">
              <span className="bg-white text-primary-600 py-1 px-3 rounded-full text-sm font-medium">
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

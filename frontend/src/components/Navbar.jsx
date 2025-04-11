import React from 'react';
import { FiBriefcase } from 'react-icons/fi';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-indigo-600 p-2 rounded-lg mr-2 shadow-sm">
              <FiBriefcase className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg md:text-xl font-semibold text-gray-800">
              {/* <span className="text-indigo-600">Recruitly</span> */}
              <span className="font-bold">Recruitly</span>
            </h1>
          </div>
          <div>
            <span className="bg-gray-100 text-gray-800 py-1 px-3 rounded-full text-sm font-medium">
              Enterprise Edition
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

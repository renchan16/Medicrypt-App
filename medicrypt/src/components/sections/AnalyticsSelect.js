import React from 'react';
import { IoMdArrowDropdown } from "react-icons/io";

const AnalyticsSelect = ({ value, onChange, className, children }) => {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={onChange}
        className="appearance-none w-full bg-transparent px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <IoMdArrowDropdown className="h-4 w-4" />
      </div>
    </div>
  );
};

export default AnalyticsSelect;
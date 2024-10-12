import React, { useState } from 'react';

export const AnalyticsTooltip = ({ metric, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block w-full">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-10 px-3 py-2 w-full text-sm font-medium text-white text-center bg-gray-900 rounded-lg shadow-sm tooltip dark:bg-gray-700 top-full left-0">
          {metric}
        </div>
      )}
    </div>
  );
};
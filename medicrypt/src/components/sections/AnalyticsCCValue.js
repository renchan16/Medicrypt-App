import React from 'react';

const AnalyticsCCValue = ({ value, min, max, className = '', metricLabel, idealZero = false }) => {
  let progressValue;

  if (idealZero) {
    // Calculate how close the value is to 0 (0 to 1 scale)
    const clampedValue = Math.max(min, Math.min(max, value));
    const closenessTo0 = 1 - Math.abs(clampedValue) / Math.max(Math.abs(min), Math.abs(max));
    progressValue = closenessTo0 * 100;
  } else {
    // For metrics where higher values are better, use the original logic
    progressValue = ((value - min) / (max - min)) * 100;
  }

  // Ensure the progress value is between 0 and 100
  progressValue = Math.min(Math.max(progressValue, 0), 100);

  return (
    <div>
        <div className="flex justify-between text-sm">
            <span>{metricLabel} {value}</span>
            <span>Ideal: close to 0</span>
        </div>
        <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
            <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progressValue}%` }}
            ></div>
        </div>
    </div>
  );
};

export default AnalyticsCCValue;
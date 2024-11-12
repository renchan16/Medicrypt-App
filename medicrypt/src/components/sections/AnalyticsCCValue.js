/**
 * AnalyticsCCValue Component
 *
 * The `AnalyticsCCValue` component visualizes the Correlation Coefficient as a progress bar,
 * allowing users to quickly assess the value of the metric. It supports both ideal conditions 
 * where a lower value is preferred (idealZero) and general metrics where higher values are better.
 *
 * Props:
 * -------
 * @param {number} value - The current value of the Correlation Coefficient to be displayed.
 * @param {number} min - The minimum possible value for the metric, used for scaling the progress bar.
 * @param {number} max - The maximum possible value for the metric, also used for scaling the progress bar.
 * @param {string} className - Custom CSS class names for additional styling of the progress bar.
 * @param {string} metricLabel - Label describing the metric being displayed alongside the value.
 * @param {boolean} idealZero - Indicates if the ideal value is close to zero. When true, the progress bar 
 *                              reflects how close the current value is to zero.
 *
 * Functions:
 * ----------
 * - Calculates the progress value based on the provided `value`, `min`, and `max` props. It adjusts 
 *   the progress bar's width to represent the metric's performance.
 * - Ensures that the progress value is clamped between 0 and 100, providing a consistent visual representation.
 *
 * Usage:
 * ------
 * The `AnalyticsCCValue` component is intended for use in analytics dashboards where the correlation 
 * coefficient needs to be visualized. It allows users to easily interpret the value in relation to its 
 * ideal state.
 *
 * Example:
 * -------
 * <AnalyticsCCValue value={0.85} min={-1} max={1} metricLabel="Correlation Coefficient" />
 *
 * Dependencies:
 * -------------
 * - React: Core library for component rendering.
 *
 * Code Author:
 * ------------
 * - Charles Andre C. Bandala
 * 
 * Date Created: 10/6/2024
 * Last Modified: 11/11/2024
 */

import React from 'react';

const AnalyticsCCValue = ({ value, min, max, className = '', metricLabel, idealZero = false }) => {
    let progressValue;

    if (idealZero) {
        // Calculate how close the value is to 0 (0 to 1 scale)
        const clampedValue = Math.max(min, Math.min(max, value));
        const closenessTo0 = 1 - Math.abs(clampedValue) / Math.max(Math.abs(min), Math.abs(max));
        progressValue = closenessTo0 * 100;
    } 
    else {
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
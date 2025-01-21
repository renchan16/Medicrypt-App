/**
 * AnalyticsSelect Component
 *
 * The `AnalyticsSelect` component provides a dropdown interface for selecting a video from a 
 * list of available options. It enhances user experience by allowing researchers to easily choose 
 * a video for which they want to view metrics. The component is styled to blend seamlessly with 
 * other UI elements while providing a clear and functional design.
 *
 * Props:
 * -------
 * @param {string} value - The currently selected value of the dropdown, representing the 
 *                         selected video.
 * @param {function} onChange - A callback function to handle changes in selection. This function 
 *                              is triggered when the user selects a different option from the dropdown.
 * @param {string} className - Custom CSS class names for additional styling of the dropdown wrapper.
 * @param {React.ReactNode} children - The options to be displayed within the dropdown, typically 
 *                                      consisting of <option> elements.
 *
 * Usage:
 * ------
 * The `AnalyticsSelect` component is intended for use in analytics dashboards where users need 
 * to select specific videos to analyze metrics related to those videos.
 *
 * Example:
 * -------
 * <AnalyticsSelect value={selectedVideo} onChange={handleVideoChange} className="my-select">
 *   <option value="video1.mp4">Video 1</option>
 *   <option value="video2.mp4">Video 2</option>
 * </AnalyticsSelect>
 *
 * Dependencies:
 * -------------
 * - React: Core library for component rendering.
 * - IoMdArrowDropdown: An icon from the `react-icons` library to visually indicate the dropdown 
 *                      functionality.
 *
 * Code Author:
 * ------------
 * - Charles Andre C. Bandala
 * 
 * Date Created: 10/6/2024
 * Last Modified: 11/11/2024
 */

import React from 'react';
import { IoMdArrowDropdown } from "react-icons/io";

const AnalyticsSelect = ({ value, onChange, className, children }) => {
  return (
    <div className={`relative ${className}`}>
        <select
            value={value}
            onChange={onChange}
            className={`
                appearance-none 
                w-full 
                bg-transparent 
                px-4 
                py-2 
                pr-8 
                rounded-md 
                shadow 
                leading-tight 
                focus:outline-none 
                focus:shadow-outline
            `}
        >
            {children}
        </select>
        <div 
            className={`
                pointer-events-none 
                absolute 
                inset-y-0 
                right-0 
                flex 
                items-center 
                px-2 
                text-gray-700
            `}>
            <IoMdArrowDropdown className="h-4 w-4" />
        </div>
    </div>
  );
};

export default AnalyticsSelect;
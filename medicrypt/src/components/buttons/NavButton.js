import React from "react";

/**
 * NavButton Component
 *
 * This `NavButton` component is a reusable navigation button used in this React application,
 * suitable for navigating within folders or through results on a results page. The component accepts
 * customizable styles, text, icons, and functions for onClick events, making it versatile for various
 * navigation tasks.
 *
 * Props:
 * -------
 * @param {string} className - Custom CSS class names for additional styling.
 * @param {string} buttonText - Text displayed on the button.
 * @param {string} buttonColor - Primary background color for the button.
 * @param {string} hoverColor - Background color on hover. Defaults to `buttonColor` if not specified.
 * @param {string} buttonTextColor - Text color for the button.
 * @param {string} hoverTextColor - Text color on hover.
 * @param {React.Component} buttonIcon - Icon displayed on the button. Should be passed as a React component, e.g., `Icon`.
 * @param {function} onClickFunction - Function to be called when the button is clicked.
 * @param {string} filePath - File path used for folder navigation. When provided, the button opens this file location through the Electron `openFileLocation` method.
 *
 * Functions:
 * ----------
 * - handleClick: This function is triggered when the button is clicked. It first attempts to open the `filePath` (if provided)
 *                using Electron's `openFileLocation` function, with error handling for cases where the file location cannot
 *                be opened. If `onClickFunction` is defined, it then calls this function.
 *
 * Usage:
 * ------
 * This component is designed for navigation within a React app with Electron integration.
 * It supports customizable colors, icons, and text. The component can be used in results pages or any other navigational context.
 *
 * Dependencies:
 * -------------
 * - React: Core React library for creating components.
 * - Electron: For accessing the `openFileLocation` method in `window.electron`, enabling interaction with the filesystem.
 *
 * Code Author:
 * ------------
 * - Charles Andre C. Bandala
 */

export default function NavButton({ 
    className, 
    buttonText, 
    buttonColor, 
    hoverColor = buttonColor, 
    buttonTextColor, 
    hoverTextColor, 
    buttonIcon: Icon, 
    onClickFunction, 
    filePath 
}) {
    const handleClick = async () => {
        if (filePath) {
            try {
                await window.electron.openFileLocation(filePath);
            } 
            catch (error) {
                console.error("Error opening file location:", error);
            }
        }

        if (typeof onClickFunction === 'function') {
            onClickFunction();
        }
    };

    return (
        <div className={`${className}`}>
            <button
                className={`w-full h-full rounded-md bg-${buttonColor} font-medium text-${buttonTextColor} text-lg flex items-center justify-center transition-colors hover:bg-${hoverColor} hover:text-${hoverTextColor}`}
                onClick={handleClick}
                >
                {Icon && <Icon className="mr-2" size={22} />}
                {buttonText}
            </button>
        </div>
    );
}
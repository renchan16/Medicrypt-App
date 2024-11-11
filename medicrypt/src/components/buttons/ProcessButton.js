import React from "react";

/**
 * ProcessButton Component
 *
 * This `ProcessButton` component serves as the main navigational button within pages in the CryptographyPages section and
 * AnalysisPages section. It is designed with customizable styles, text, icons, and an enabled/disabled state, making it 
 * suitable for navigation and other interactions across the different "forms" pages within the application.
 *
 * Props:
 * -------
 * @param {string} className - Custom CSS class names for additional styling.
 * @param {string} buttonText - Text displayed on the button.
 * @param {React.Component} buttonIcon - Icon component for the button, such as `Icon`. It can be displayed on either
 *                                       the left or right of the text, based on `iconLocation`.
 * @param {string} iconLocation - Position of the icon relative to the text. Accepts "left" (default) or "right".
 * @param {boolean} isEnabled - Controls whether the button is enabled. Defaults to `true`. When set to `false`,
 *                              the button is disabled and its opacity is reduced.
 * @param {function} onClickFunction - Function to be called when the button is clicked. This enables custom
 *                                     actions depending on the page's specific needs.
 *
 * Functions:
 * ----------
 * - Renders a button with various customizable states and styling, including hover effects, enabled/disabled states,
 *   and icon positioning.
 *
 * Usage:
 * ------
 * The `ProcessButton` component is intended as the primary navigation button in CryptographyPages, guiding users
 * through different pages of a cryptographic process or any sequential steps. It provides flexibility with icons,
 * colors, and text, which can adapt to each page's theme.
 *
 * Dependencies:
 * -------------
 * - React: Core library for component rendering.
 *
 * Code Author:
 * ------------
 * - Charles Andre C. Bandala
 * 
 * Date Created: 9/11/2024
 * Last Modified: 11/11/2024
 */

export default function ProcessButton({
    className,
    buttonText,
    buttonIcon: Icon,
    iconLocation = "left",
    isEnabled = true,
    onClickFunction
}) {
    return (
        <div className={`${className} ${isEnabled ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            <button
                className={`
                    w-full 
                    h-full flex 
                    items-center 
                    justify-center 
                    bg-white 
                    text-secondary 
                    border-2 
                    border-secondary 
                    rounded-2xl 
                    font-bold 
                    text-lg 
                    transition-all 
                    duration-300 
                    hover:bg-secondary 
                    hover:text-white 
                    hover:border-transparent 
                    ${isEnabled ? "opacity-100" : "opacity-0"}
                `}
                onClick={onClickFunction}
                disabled={!isEnabled}
            >
                {iconLocation === "left" && Icon && <Icon className="mr-2" size={22} />}
                {buttonText}
                {iconLocation === "right" && Icon && <Icon className="ml-2" size={22} />}
            </button>
        </div>
    );
}

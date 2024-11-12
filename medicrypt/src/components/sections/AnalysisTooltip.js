/**
 * AnalyticsTooltip Component
 *
 * This `AnalyticsTooltip` component displays a tooltip that provides the full meanings of metrics 
 * that are abbreviated. The tooltip is revealed when the user hovers over the wrapped children element 
 * and hidden when the mouse leaves the element. This enhances user understanding of metric terms 
 * throughout the application.
 *
 * Props:
 * -------
 * @param {string} metric - The full meaning of the abbreviated metric to be displayed in the tooltip.
 * @param {React.ReactNode} children - The element(s) that the user can hover over to reveal the tooltip.
 *
 * Functions:
 * ----------
 * - Renders a tooltip containing the full metric meaning, which is displayed conditionally based 
 *   on the mouse hover state over the children element.
 *
 * Usage:
 * ------
 * The `AnalyticsTooltip` component is intended to improve user experience by clarifying metric 
 * abbreviations throughout the application. It can be wrapped around any element that requires 
 * tooltip functionality, enhancing the accessibility of metric descriptions.
 *
 * Example:
 * -------
 * <AnalyticsTooltip metric="Standard Deviation">
 *   <span>SD</span>
 * </AnalyticsTooltip>
 *
 * This will display "Standard Deviation" when the user hovers over "SD".
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

import React, { useState } from 'react';

export const AnalyticsTooltip = ({ 
    metric, 
    children 
}) => {
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
                <div 
                    className={`
                        absolute 
                        z-10 
                        px-3 
                        py-2 
                        w-full 
                        text-sm 
                        font-medium 
                        text-white 
                        text-center 
                        bg-gray-900 
                        rounded-lg 
                        shadow-sm 
                        tooltip 
                        dark:bg-gray-700 
                        top-full left-0
                    `}
                >
                    {metric}
                </div>
            )}
        </div>
    );
};
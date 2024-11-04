import React from "react";

export const AnalyticsCard = ({ className = "", children, onClick }) => {
/**
 * AnalyticsCard Component
 *
 * The `AnalyticsCard` component serves as a container for displaying various analytics-related 
 * information in a card format. It provides a flexible layout with a customizable background, 
 * padding, and shadow effects. The card can also be made interactive by allowing an optional 
 * click event.
 *
 * Props:
 * -------
 * @param {string} className - Custom CSS class names for additional styling applied to the card.
 * @param {React.ReactNode} children - The content to be displayed inside the card, allowing 
 *                                      for flexible usage of various elements.
 * @param {function} onClick - An optional click handler that enables interaction with the card. 
 *                             When provided, the card displays a pointer cursor to indicate its interactivity.
 *
 * Functions:
 * ----------
 * - Renders a card with a background, padding, shadow, and rounded corners. It applies 
 *   a cursor style based on the presence of the `onClick` prop.
 *
 * Usage:
 * ------
 * The `AnalyticsCard` component is designed to display grouped analytics data, such as metrics 
 * or statistics, in a visually appealing way. It can be used in dashboards or reports to 
 * highlight important information.
 *
 * Example:
 * -------
 * <AnalyticsCard onClick={handleClick}>
 *   <AnalyticsCardTitle>Card Title</AnalyticsCardTitle>
 *   <AnalyticsCardContent>Some content goes here.</AnalyticsCardContent>
 * </AnalyticsCard>
 *
 * Dependencies:
 * -------------
 * - React: Core library for component rendering.
 *
 * Code Author:
 * ------------
 * - Charles Andre C. Bandala
 */
    return (
        <div
            className={`${className} bg-secondary2 relative overflow-hidden p-6 shadow-[0_0_4px_1px_rgba(0,0,0,0.10)] rounded-xl ${onClick ? "cursor-pointer" : "cursor-auto"}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export const AnalyticsCardTitle = ({ className = "", children }) => (
/**
 * AnalyticsCardTitle Component
 *
 * The `AnalyticsCardTitle` component represents the title section of the `AnalyticsCard`.
 * It is designed to display the title in a prominent style, with optional custom styling.
 *
 * Props:
 * -------
 * @param {string} className - Custom CSS class names for additional styling. Defaults to an empty string,
 *                             which applies a default font weight and margin.
 * @param {React.ReactNode} children - The content to be displayed as the title.
 *
 * Functions:
 * ----------
 * - Renders the title with customizable styling based on the provided className.
 *
 * Dependencies:
 * -------------
 * - React: Core library for component rendering.
 *
 * Code Author:
 * ------------
 * - Charles Andre C. Bandala
 */
    <div className={`${className === "" ? "font-semibold mb-4" : className}`}>{children}</div>
);

export const AnalyticsCardContent = ({ className = "", children }) => (
/**
 * AnalyticsCardContent Component
 *
 * The `AnalyticsCardContent` component represents the content section of the `AnalyticsCard`.
 * It is designed to display the main body text in a readable format, with optional custom styling.
 *
 * Props:
 * -------
 * @param {string} className - Custom CSS class names for additional styling. Defaults to an empty string,
 *                             which applies a default font weight.
 * @param {React.ReactNode} children - The content to be displayed within the card content area.
 *
 * Functions:
 * ----------
 * - Renders the content with customizable styling based on the provided className.
 *
 * Dependencies:
 * -------------
 * - React: Core library for component rendering.
 *
 * Code Author:
 * ------------
 * - [Your Name]
 */
    <div className={`${className === "" ? "font-normal" : className}`}>{children}</div>
);
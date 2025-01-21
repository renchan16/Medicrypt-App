/**
 * AnalyticsCard Component Set
 *
 * This set of components (`AnalyticsCard`, `AnalyticsCardTitle`, and `AnalyticsCardContent`) is designed 
 * to display analytics information in a structured card format. The components work together to provide 
 * a flexible layout with customizable styling, and are suitable for use in dashboards or reports where 
 * grouped data visualization is required.
 *
 * Components:
 * -----------
 * 1. **AnalyticsCard**:
 *    - Serves as a container for analytics content with a customizable background, padding, and shadow.
 *    - Can be interactive with an optional `onClick` event handler.
 *
 *    Props:
 *    - `className` (string): Additional CSS class names for the card's styling.
 *    - `children` (React.ReactNode): The main content of the card, which can include other components.
 *    - `onClick` (function): An optional click event handler for interactive cards. Displays a pointer cursor when active.
 *
 * 2. **AnalyticsCardTitle**:
 *    - Represents the title section of the `AnalyticsCard`.
 *    - Provides a prominent style for the title, with optional custom styling through `className`.
 *
 *    Props:
 *    - `className` (string): CSS class names for styling. Defaults to a bold font and margin.
 *    - `children` (React.ReactNode): The content to be displayed as the card's title.
 *
 * 3. **AnalyticsCardContent**:
 *    - Represents the main content section of the `AnalyticsCard`.
 *    - Displays body text in a readable format, with optional custom styling through `className`.
 *
 *    Props:
 *    - `className` (string): CSS class names for styling. Defaults to normal font weight.
 *    - `children` (React.ReactNode): The main content displayed within the card.
 *
 * Functions:
 * ----------
 * - `AnalyticsCard` renders a container for analytics data, applying shadow, padding, and a cursor style based on `onClick`.
 * - `AnalyticsCardTitle` and `AnalyticsCardContent` render the title and content sections of the card, respectively, with customizable styling.
 *
 * Usage:
 * ------
 * This component set is suitable for organizing and displaying analytics data. For example, it can be used to display metrics or key performance indicators (KPIs) in a dashboard:
 *
 * ```jsx
 * <AnalyticsCard onClick={handleClick}>
 *   <AnalyticsCardTitle>Card Title</AnalyticsCardTitle>
 *   <AnalyticsCardContent>Some content goes here.</AnalyticsCardContent>
 * </AnalyticsCard>
 * ```
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

import React from "react";

export const AnalyticsCard = ({ className = "", children, onClick }) => {
    return (
        <div
            className={`
                ${className} 
                bg-secondary2 
                relative 
                overflow-hidden 
                p-6 
                shadow-[0_0_4px_1px_rgba(0,0,0,0.10)] 
                rounded-xl 
                ${onClick ? "cursor-pointer" : "cursor-auto"}
            `}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export const AnalyticsCardTitle = ({ className = "", children }) => (
    <div className={`${className === "" ? "font-semibold font-avantGarde mb-4" : className}`}>{children}</div>
);

export const AnalyticsCardContent = ({ className = "", children }) => (
    <div className={`${className === "" ? "font-normal" : className}`}>{children}</div>
);
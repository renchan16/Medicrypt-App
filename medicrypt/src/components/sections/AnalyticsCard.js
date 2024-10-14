import React from "react";

export const AnalyticsCard = ({ className, children, onClick }) => {
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
    <div className={`${className === "" ? "font-semibold mb-4" : className}`}>{children}</div>
);

export const AnalyticsCardContent = ({ className = "", children }) => (
    <div className={`${className === "" ? "font-normal" : className}`}>{children}</div>
);

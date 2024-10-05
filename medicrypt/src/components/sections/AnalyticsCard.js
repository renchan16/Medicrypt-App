import React from "react";

export const AnalyticsCard = ({className, children}) => {

    return (
        <div className={`${className} relative overflow-hidden p-6 shadow-[0_0_4px_1px_rgba(0,0,0,0.25)] rounded-xl`}>
            {children}
        </div>
    );
};

export const AnalyticsCardTitle = ({className="", children}) => <h1 className={`${className === "" ? "font-semibold mb-4" : className}`}>{children}</h1>
export const AnalyticsCardContent = ({className="", children}) => <p className={`${className === "" ? "font-normal" : className}`}>{children}</p>
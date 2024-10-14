import React from "react";

export const ProcessAlert = ({ children, processStatus }) => {
    return (
        <div className={`bg-secondary1 border-l-4 p-4 rounded ${processStatus === "success" ? "border-green-600 text-green-900" : "border-red-900 text-red-900"}`} role="alert">
            {children}
        </div>
    );
};

export const ProcessAlertTitle = ({ children }) => <h3 className="font-bold">{children}</h3>;
export const ProcessAlertDescription = ({ children }) => <p>{children}</p>;
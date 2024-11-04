import React from "react";

/**
 * ProcessAlert Component
 *
 * The `ProcessAlert` component is designed to display alert messages based on the status of 
 * cryptographic or analysis processes. It visually indicates whether the process was successful 
 * or if an error occurred, providing immediate feedback to the user. The alert is styled 
 * with different colors to distinguish between success and error states.
 *
 * Props:
 * -------
 * @param {React.ReactNode} children - The content to be displayed inside the alert, typically 
 *                                      a message describing the status of the process.
 * @param {string} processStatus - A string indicating the status of the process. It can be 
 *                                 either "success" or another string representing an error 
 *                                 state, which determines the alert's styling.
 *
 * Usage:
 * ------
 * The `ProcessAlert` component is intended for use in the `ProcessingPage` or `EvaluatingPage` 
 * to provide users with updates on the outcome of cryptographic processes or analysis tasks.
 *
 * Example:
 * -------
 * <ProcessAlert processStatus="success">
 *   <ProcessAlertTitle>Process Completed Successfully</ProcessAlertTitle>
 *   <ProcessAlertDescription>Your video has been encrypted successfully!</ProcessAlertDescription>
 * </ProcessAlert>
 *
 * Subcomponents:
 * ---------------
 * - ProcessAlertTitle: Renders a bold title for the alert, typically used for indicating the 
 *                      status of the process (e.g., success or error).
 * 
 * - ProcessAlertDescription: Renders a description below the title, providing more details about 
 *                            the alert message.
 *
 * Dependencies:
 * -------------
 * - React: Core library for component rendering.
 *
 * Code Author:
 * ------------
 * - Charles Andre C. Bandala
 */

export const ProcessAlert = ({ children, processStatus }) => {
    return (
        <div className={`bg-secondary2 border-l-4 p-4 rounded ${processStatus === "success" ? "border-green-600 text-green-900" : "border-red-900 text-red-900"}`} role="alert">
            {children}
        </div>
    );
};

export const ProcessAlertTitle = ({ children }) => <h3 className="font-bold">{children}</h3>;
export const ProcessAlertDescription = ({ children }) => <p>{children}</p>;
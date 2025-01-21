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
 * 
 * Date Created: 10/3/2024
 * Last Modified: 11/11/2024
 */

import React from "react";

export const ProcessAlert = ({ children, processStatus }) => {
    return (
        <div 
            className={`
                 
                border-l-8
                border-b-8  
                pt-4
                pl-6
                pr-4
                pb-4
                rounded-2xl 
                ${processStatus === "success" ? 
                    "border-primary1 text-primary0 bg-secondary2" : 
                    "border-red-800 text-red-900 bg-red-100"
                }
            `} 
            role="alert">
            {children}
        </div>
    );
};

export const ProcessAlertTitle = ({ children }) => <h3 className="font-bold font-avantGarde">{children}</h3>;
export const ProcessAlertDescription = ({ children }) => <p>{children}</p>;
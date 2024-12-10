/**
 * ProcessComplete Component
 *
 * The `ProcessComplete` component renders the interface that displays the results of 
 * a completed process, whether it be a cryptographic operation or an analysis task. 
 * This component provides users with feedback on the status of the process, including 
 * success or error messages, input files, and options for next steps.
 *
 * Props:
 * -------
 * @param {string} processType - The type of process that has been completed (e.g., 
 *                                "Encryption", "Decryption", "Evaluation").
 * @param {string} processStatus - A string indicating the status of the process, 
 *                                 either "success" or "failed".
 * @param {string} processDescription - A descriptive message about the process outcome, 
 *                                      providing additional context to the user.
 * @param {Array<string>} inputFiles - An array of file names that were processed 
 *                                     during the operation.
 * @param {string} outputLocation - The location where the output files are saved, 
 *                                  used when the user opts to view the processed files.
 * @param {string} nextPageButtonText - Text for the button that navigates to the next page, 
 *                                       typically displayed when the process is successful.
 * @param {string} viewFileButtonText - Text for the button that allows the user to view 
 *                                       the processed files, only shown for non-evaluation processes.
 * @param {Function} navigateNextPage - Function to handle navigation to the next page.
 * @param {Function} navigatePrevPage - Function to handle retrying the process by going 
 *                                       back to the previous page.
 * @param {Function} navigateHome - Function to handle navigation back to the home page.
 *
 * Usage:
 * ------
 * The `ProcessComplete` component is intended for use in both the `EvaluatingPage` and 
 * `ProcessingPage` to inform users of the results of their operations, allowing for 
 * navigation based on the success or failure of the process.
 *
 * Example:
 * -------
 * <ProcessComplete 
 *   processType="Encryption"
 *   processStatus="success"
 *   processDescription="Your video has been encrypted successfully."
 *   inputFiles={["video1.mp4", "video2.mp4"]}
 *   outputLocation="/path/to/output"
 *   nextPageButtonText="View Analytics"
 *   viewFileButtonText="View Output Files"
 *   navigateNextPage={handleNextPage}
 *   navigatePrevPage={handleRetry}
 *   navigateHome={handleHome}
 * />
 *
 * Dependencies:
 * -------------
 * - React: Core library for component rendering.
 * - React Icons: Icons for enhancing the UI experience (e.g., FiBarChart, LuHome, FaRegFolder, TbReload).
 * - ProcessAlert: Subcomponents used for displaying alert messages regarding process status.
 * - NavButton: A button component used for navigation actions in the UI.
 *
 * Code Author:
 * ------------
 * - Charles Andre C. Bandala
 * 
 * Date Created: 10/3/2024
 * Last Modified: 11/11/2024
 */

import React from 'react';
import { FiBarChart } from "react-icons/fi";
import { LuHome } from "react-icons/lu";
import { FaRegFolder } from "react-icons/fa";
import { TbReload } from "react-icons/tb";
import { ProcessAlert, ProcessAlertTitle, ProcessAlertDescription } from './ProcessAlert';
import NavButton from '../buttons/NavButton';

const ProcessComplete = ({ 
  processType, 
  processStatus, 
  processDescription, 
  inputFiles, 
  outputLocation, 
  nextPageButtonText, 
  viewFileButtonText, 
  navigateNextPage, 
  navigatePrevPage, 
  navigateHome
}) => {
  return (
    <div className="w-11/12 space-y-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <h1 className="mb-4 text-4xl text-secondary font-bold font-avantGarde">
            {processType} {processStatus === "success" ? "Complete" : "Failed"}!
        </h1>

        <ProcessAlert processStatus={processStatus}>
            <ProcessAlertTitle>{processStatus === "success" ? "Success" : "Error"}</ProcessAlertTitle>
            <ProcessAlertDescription>{processDescription}</ProcessAlertDescription>
        </ProcessAlert>

        <p className="text-sm text-gray-600">
            File processed: <span className="font-medium">{inputFiles !== "" ? inputFiles.join(', ') : "None"}</span>
        </p>

        <div className="flex flex-col gap-4">
            {/* Success Actions */}
            <div className={`${processStatus === "success" ? 'block' : 'hidden'} flex flex-shrink-0 gap-4`}>
                {processType !== "Evaluation" && (
                    <NavButton
                        className="w-full h-12 rounded-lg border-2 border-secondary"
                        buttonText={viewFileButtonText}
                        buttonColor="white"
                        hoverColor="secondary1"
                        buttonTextColor="secondary"
                        hoverTextColor= "white"
                        buttonIcon={FaRegFolder}
                        filePath={outputLocation}
                    />
                )}
                
                <NavButton
                    className="w-full h-12 rounded-lg border-2 border-secondary"
                    buttonText={nextPageButtonText}
                    buttonColor="white"
                    hoverColor="secondary1"
                    buttonTextColor="secondary"
                    hoverTextColor= "white"
                    buttonIcon={FiBarChart}
                    onClickFunction={navigateNextPage}
                />
            </div>

            {/* Error Action (Try Again) */}
            <div className={`${processStatus === "success" ? 'hidden' : 'block'} flex flex-shrink-0 gap-4`}>
                <NavButton
                    className="w-full h-12 rounded-lg border-2 border-secondary"
                    buttonText="Try Again"
                    buttonColor="white"
                    hoverColor="secondary1"
                    buttonTextColor="secondary"
                    hoverTextColor= "white"
                    buttonIcon={TbReload}
                    onClickFunction={navigatePrevPage}
                />
            </div>

            {/* Return Home */}
            <NavButton
                className="w-full h-12 rounded-lg border-2 border-secondary"
                buttonText="Return Home"
                buttonColor="white"
                hoverColor="secondary1"
                buttonTextColor="secondary"
                hoverTextColor= "white"
                buttonIcon={LuHome}
                onClickFunction={navigateHome}
            />
        </div>
    </div>
  );
};

export default ProcessComplete;
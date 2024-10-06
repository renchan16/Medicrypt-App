import React from 'react';
import { FiBarChart } from "react-icons/fi";
import { LuHome } from "react-icons/lu";
import { FaRegFolder } from "react-icons/fa";
import { TbReload } from "react-icons/tb";
import { ProcessAlert, ProcessAlertTitle, ProcessAlertDescription } from './ProcessAlert';
import NavButton from '../buttons/NavButton';

const ProcessComplete = ({ processType, processStatus, processDescription, inputFile, outputLocation, nextPageButtonText, viewFileButtonText, navigateNextPage, navigatePrevPage, navigateHome
}) => {
  return (
    <div className="w-11/12 space-y-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <h1 className="mb-4 text-4xl text-primary1 font-bold">
        {processType} {processStatus === "success" ? "Complete" : "Failed"}!
      </h1>

      <ProcessAlert processStatus={processStatus}>
        <ProcessAlertTitle>{processStatus === "success" ? "Success" : "Error"}</ProcessAlertTitle>
        <ProcessAlertDescription>{processDescription}</ProcessAlertDescription>
      </ProcessAlert>

      <p className="text-sm text-gray-600">
        File processed: <span className="font-medium">{inputFile !== "" ? inputFile.join(', ') : "None"}</span>
      </p>

      <div className="flex flex-col gap-4">
        {/* Success Actions */}
        <div className={`${processStatus === "success" ? 'block' : 'hidden'} flex flex-shrink-0 gap-4`}>
          <NavButton
            className="w-full h-12"
            buttonText={nextPageButtonText}
            buttonColor="primary1"
            hoverColor="primary0"
            buttonTextColor="white"
            buttonIcon={FiBarChart}
            onClickFunction={navigateNextPage}
          />
          {processType !== "Evaluation" && (
            <NavButton
              className="w-full h-12"
              buttonColor="primary2"
              buttonText={viewFileButtonText}
              buttonTextColor="black"
              buttonIcon={FaRegFolder}
              filePath={outputLocation}
              />
          )}
        </div>

        {/* Error Action (Try Again) */}
        <div className={`${processStatus === "success" ? 'hidden' : 'block'} flex flex-shrink-0 gap-4`}>
          <NavButton
            className="w-full h-12"
            buttonText="Try Again"
            buttonColor="primary1"
            hoverColor="primary0"
            buttonTextColor="white"
            buttonIcon={TbReload}
            onClickFunction={navigatePrevPage}
          />
        </div>

        {/* Return Home */}
        <NavButton
          className="w-full h-12"
          buttonText="Return Home"
          buttonColor="primary2"
          buttonTextColor="black"
          buttonIcon={LuHome}
          onClickFunction={navigateHome}
        />
      </div>
    </div>
  );
};

export default ProcessComplete;
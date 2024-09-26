import React from "react";
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { ProcessAlert, ProcessAlertTitle, ProcessAlertDescription } from "./ProcessAlert";
import NavButton from "../buttons/NavButton";
import { FiBarChart } from "react-icons/fi";
import { LuHome } from "react-icons/lu";
import { FaRegFolder } from "react-icons/fa";
import { TbReload } from "react-icons/tb";

export default function ProcessComplete({ className, inputFile, processType, processStatus, processDescription }) {
    const navigate = useNavigate();

    const navigateHome = () => {
        navigate('/');
    }

    const navigateProcessPage = () => {
        navigate(`/${processType.toLowerCase()}`);
    }

    return (
        <div className={`${className} w-11/12 space-y-6`}>
            <h1 className="mb-4 text-4xl text-primary1 font-bold">{processType}ion {processStatus}!</h1>

            <ProcessAlert processStatus={processStatus}>
                <ProcessAlertTitle>{processStatus == "success" ? "Sucess" : "Error" }</ProcessAlertTitle>
                <processDescription>
                    {processDescription}
                </processDescription>
            </ProcessAlert>
            
            <p className="text-sm text-gray-600">
                File processed: <span className="font-medium">{inputFile !== "" ? inputFile : "None"}</span>
            </p>

            <div className="flex flex-col gap-4">
                <div className={`${processStatus === "success" ? 'block' : 'hidden'} flex flex-shrink-0 gap-4`}>
                    <NavButton
                        className={`w-full h-12`}
                        buttonText={`Evaluate ${processType}ion`}
                        buttonColor={"primary1"}
                        hoverColor={"primary0"}
                        buttonTextColor={"white"}
                        buttonIcon={FiBarChart}
                        onClickFunction={navigateHome} 
                        />
                    <NavButton
                        className={`w-full h-12`}
                        buttonColor={"primary2"}
                        buttonText={"View File"}
                        buttonTextColor={"black"}
                        buttonIcon={FaRegFolder}
                        onClickFunction={navigateHome} 
                        />
                </div>
                <div className={`${processStatus === "success" ? 'hidden' : 'block'} flex flex-shrink-0 gap-4`}>
                    <NavButton
                        className={`w-full h-12`}
                        buttonText={`Try Again`}
                        buttonColor={"primary1"}
                        hoverColor={"primary0"}
                        buttonTextColor={"white"}
                        buttonIcon={TbReload}
                        onClickFunction={navigateProcessPage} 
                        />
                </div>
                <NavButton
                    className={`w-full h-12`}
                    buttonText={"Return Home"}
                    buttonColor={"primary2"}
                    buttonTextColor={"black"}
                    buttonIcon={LuHome}
                    onClickFunction={navigateHome} 
                    />
            </div>
        </div>
    );
}
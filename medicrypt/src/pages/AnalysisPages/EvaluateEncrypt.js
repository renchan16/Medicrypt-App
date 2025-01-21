/**
 * EvaluateEncrypt Component
 *
 * The `EvaluateEncrypt` component is designed for users to evaluate the performance 
 * metrics of the encryption process after encryption has taken place. It allows users 
 * to specify the destination for a CSV file that will contain performance metrics 
 * such as the Correlation Coefficient, Entropy, UACI, NPCR, and Encryption Time.
 *
 * Functionality:
 * --------------
 * - Retrieves input data from the location state, including:
 *   - `algorithm`: The encryption algorithm used during the encryption process.
 *   - `origFilepaths`: The file paths of the original input files that were encrypted.
 *   - `processedFilepaths`: The file paths of the encrypted output files.
 *   - `timeFilepaths`: The file paths for any timing metrics generated during encryption.
 * - Utilizes refs to manage and validate the input field for the CSV output directory.
 * - Validates user input before processing and navigating to the evaluation results 
 *   page to display the metrics.
 * - Incorporates page transition animations using Framer Motion for an enhanced 
 *   user experience.
 *
 * Props:
 * -------
 * None.
 *
 * Dependencies:
 * -------------
 * - React: Core library for component rendering.
 * - react-router-dom: For navigation and accessing location state.
 * - framer-motion: For page transition animations.
 * - FilePathInput: Custom input component for handling file paths.
 * - ProcessButton: Custom button component for processing input data.
 * - react-icons: For iconography (FaFolder, FaArrowCircleLeft).
 *
 * Example:
 * -------
 * <EvaluateEncrypt />
 *
 * Code Author:
 * ------------
 * - Charles Andre C. Bandala, Renz Carlo T. Caritativo
 * 
 * Date Created: 10/2/2024
 * Last Modified: 1/22/2025
 */

import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../pages-css/General.css';
import FilePathInput from '../../components/text input/FilePathInput';
import ProcessButton from '../../components/buttons/ProcessButton';
import { FaFolder } from 'react-icons/fa6';
import { FaArrowCircleLeft } from "react-icons/fa";
import { RiPencilRuler2Line } from "react-icons/ri";
import { FiPieChart } from "react-icons/fi";
import { motion } from 'framer-motion';

function EvaluateEncrypt() {
    const navigate = useNavigate();
    const location = useLocation();
    const { data } = location.state || {};
  
    // Get data from previous location.
    let algorithm = data['algorithm'];
    let origFilepaths = data['inputFilepaths'];
    let processedFilepaths = data['outputFilepaths'];
    let timeFilepaths = data['timeFilepaths'];

    const [outputDirpath, setOutputDirpath] = useState("");
    const [isOutputDirpathValid, setOutputDirpathValidity] = useState(true);

    const csvOutputLocationRef = useRef(null);
  
    // Process the data provided by the user. Validate the necessary fields and navigate through the next page if conditions are met.
    const processInputData = () => {
        csvOutputLocationRef.current.validate();

        if (isOutputDirpathValid) {
            navigate('/encrypt/evaluating', {
                state: {
                    processType: 'Encrypt',
                    inputs: { algorithm, origFilepaths, processedFilepaths, timeFilepaths, outputDirpath }
                }
            });
        }
    }

    // Animation variable
    const pageVariants = {
        initial: {
            opacity: 0,
            x: '-100vw',
        },
        in: {
            opacity: 1,
            x: 0,
            transition: { type: 'spring', stiffness: 50 }
        },
        out: {
            opacity: 0,
            x: '100vw',
            transition: { ease: 'easeInOut', duration: 0.3 }
        }
    };

    return (
        <div className="h-full w-full flex justify-center items-center overflow-hidden">
            <button
                onClick={() => navigate('/')}
                className="absolute top-10 left-14 flex items-center text-black hover:text-[#0f0f0f] transition-colors duration-300 text-3xl z-10"
            >
                <FaArrowCircleLeft className="mr-2 text-secondary transition-transform duration-300 transform hover:-translate-x-2" />
            </button>
            <motion.div
                className="flex items-center justify-center h-full w-full select-none"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
            >
                <div className="flex items-center justify-center h-full w-full select-none">
                    <div className="relative h-full w-11/12 p-6 overflow-x-hidden">
                        <div className="relative top-1/2 transform -translate-y-1/2">
                            <h1 className="mb-3 text-4xl font-bold text-secondary font-avantGarde flex items-center">
                                <FiPieChart className="mr-2 text-5xl" />
                                Evaluate Encryption
                            </h1>
                            <p className="mb-4 text-sm italic text-secondary text-justify">This page serves as a tool to help measure the performance metrics of the encryption process including the Correlation Coefficient, Entropy, UACI, NPCR, and Encryption Time.</p>
                            <div className="space-y-4">
                                <FilePathInput
                                    ref={csvOutputLocationRef}
                                    componentHeader="CSV File Destination"
                                    placeholderText="C:\Users\YourUsername\MetricPerVideoForlder\..."
                                    defaultDisplayText="Enter a valid directory."
                                    browseIcon={<FaFolder className="w-3/4 h-3/4 transform"/>}
                                    browseHandler={window.electron.openFolder}
                                    onValueChange={setOutputDirpath}
                                    onValidityChange={setOutputDirpathValidity}
                                    isRequired={true}
                                />
                                <div className='flex flex-row-reverse justify-between'>
                                    <ProcessButton
                                        className="relative right-0 w-40 h-14"
                                        buttonText="Evaluate"
                                        buttonIcon={RiPencilRuler2Line}
                                        iconLocation="left"
                                        isEnabled={true}
                                        onClickFunction={processInputData}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default EvaluateEncrypt;

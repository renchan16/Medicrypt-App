/**
 * Decrypt Component
 *
 * This component facilitates the decryption process of a video file. It allows users to 
 * select a decryption algorithm, input the file paths for the encrypted video and the output 
 * directory, and provide a password for decryption. The component dynamically reveals additional 
 * fields for the password and hash key file destination after the initial required fields are 
 * validated.
 *
 * Functionality:
 * --------------
 * - Allows users to choose a decryption algorithm via `AlgorithmSelector`.
 * - Validates file paths and password inputs before proceeding to the processing page.
 * - Displays additional input fields for password and hash key file destination upon 
 *   successful validation of initial inputs.
 * - Uses navigation to redirect users to the processing page with the relevant input data 
 *   when the "Next" or "Decrypt" button is clicked.
 *
 * State Variables:
 * -----------------
 * - algorithm: State variable holding the selected decryption algorithm (e.g., "FY-Logistic", "3D-Cosine").
 * - filepaths: State variable for storing the video file paths provided by the user.
 * - password: State variable for storing the password input by the user.
 * - outputDirpath: State variable for storing the output directory path for the decrypted video.
 * - hashPath: State variable for storing the hash key file destination path.
 * - isFilepathValid: State variable indicating the validity of the video file path.
 * - isPasswordValid: State variable indicating the validity of the password.
 * - isOutputDirpathValid: State variable indicating the validity of the output directory path.
 * - isHashPathValid: State variable indicating the validity of the hash key file destination path.
 * - showAdditionalFields: State variable controlling the visibility of additional fields 
 *   for password and hash key input.
 *
 * Refs:
 * ------
 * - fileInputRef: Ref for accessing and validating the video file input.
 * - passwordInputRef: Ref for accessing and validating the password input.
 * - outputDirpathInputRef: Ref for accessing and validating the output directory input.
 * - hashInputRef: Ref for accessing and validating the hash key input.
 *
 * Functions:
 * ----------
 * - processInputData(): 
 *   - Validates the current inputs and either shows additional fields or navigates to the 
 *     processing page based on the validation results.
 *
 * - showPreviousFields(): 
 *   - Resets the visibility state to show the initial input fields.
 *
 * - pageVariants: 
 *   - Defines the animation variants for page transitions using framer-motion.
 *
 * Global Variables:
 * -----------------
 * - navigate: Hook from `react-router-dom` for programmatic navigation between pages.
 *
 * Props:
 * -------
 * None.
 *
 * Dependencies:
 * -------------
 * - React: Core library for component rendering and state management.
 * - react-router-dom: For navigation and accessing the navigate function.
 * - framer-motion: For animation effects during page transitions.
 * - react-icons: For iconography (FaArrowCircleLeft, FaPaperclip, FaFolder, 
 *   FaChevronCircleLeft, FaChevronCircleRight, IoDocumentLock).
 * - AlgorithmSelector: Component for selecting the decryption algorithm.
 * - FilePathInput: Component for entering file paths.
 * - PasswordInput: Component for entering the decryption password.
 * - ProcessButton: Component for handling button actions in the decryption process.
 *
 * Example:
 * -------
 * <Decrypt />
 *
 * Code Author:
 * ------------
 * - Charles Andre C. Bandala, Renz Carlo T. Caritativo
 * 
 * Date Created: 9/15/2024
 * Last Modified: 11/11/2024
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import '../../pages-css/General.css';
import AlgorithmSelector from '../../components/switches/AlgorithmSelector';
import FilePathInput from '../../components/text input/FilePathInput';
import PasswordInput from '../../components/text input/PasswordInput';
import ProcessButton from '../../components/buttons/ProcessButton';
import { FaPaperclip } from "react-icons/fa6";
import { FaFolder } from 'react-icons/fa6';
import { FaArrowCircleLeft, FaLock } from "react-icons/fa";
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";
import { IoDocumentLock } from "react-icons/io5";
import { motion } from 'framer-motion'; // Import framer-motion

function Decrypt() {
    const navigate = useNavigate();

    const fileInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const outputDirpathInputRef = useRef(null);
    const hashInputRef = useRef(null);

    const [algorithm, setAlgorithm] = useState("");
    const [filepaths, setFilepaths] = useState("");
    const [password, setPassword] = useState("");
    const [outputDirpath, setOutputDirpath] = useState("");
    const [hashPath, setHashPath] = useState("");
    const [isFilepathValid, setFilepathValidity] = useState(false);
    const [isPasswordValid, setPasswordValidity] = useState(false);
    const [isOutputDirpathValid, setOutputDirpathValidity] = useState(true);
    const [isHashPathValid, setHashPathValidity] = useState(true);
    const [showAdditionalFields, setShowAdditionalFields] = useState(false);

    // Allows user to navigate through the next page of input fields. If last page, navigate to the decryption process itself.
    const processInputData = async () => {
        if (!showAdditionalFields) {
            fileInputRef.current.validate();
            outputDirpathInputRef.current.validate();

            if (isFilepathValid && isOutputDirpathValid) {
                setShowAdditionalFields(true);
            } else {
                console.log('Please fill in all required fields correctly.');
            }
        } else {
            passwordInputRef.current.validate();
            hashInputRef.current.validate();

            if (isPasswordValid && isHashPathValid) {
                navigate('/decrypt/processing', {
                    state: {
                        processType: 'Decrypt',
                        inputs: { algorithm, filepaths, password, outputDirpath, hashPath }
                    }
                });
            } else {
                console.log('Please fill in all required fields correctly.');
            }
        }
    };

    // Function to show the previous fields.
    const showPreviousFields = () => {
        setShowAdditionalFields(false);
    };

    // Framer-motion page transition variants
    const pageVariants = {
        initial: {
            opacity: 0,
            x: '-60vw',
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
                className='flex items-center justify-center h-full w-full select-none'
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
            >
                <div className="relative h-full w-11/12 p-6 overflow-x-hidden">
                    <div className='relative top-1/2 transform -translate-y-1/2'>
                        <h1 className="mb-3 text-4xl font-bold text-secondary font-avantGarde flex items-center">
                            <IoDocumentLock className="mr-2 text-5xl" />
                            Decrypt a Video
                        </h1>

                        <AlgorithmSelector
                            className='mt-4 mb-5'
                            componentHeader="Choose an Algorithm for Decryption"
                            optionOne="FY-Logistic"
                            optionTwo="3D-Cosine"
                            onValueChange={setAlgorithm}
                        />
                        
                        <div 
                            className={`
                                flex 
                                h-2/6 
                                mb-8 
                                transition-transform 
                                duration-500 
                                ease-in-out 
                                transform 
                                ${showAdditionalFields ? '-translate-x-full' : 'translate-x-0'}
                            `}>
                            <div className={`flex-shrink-0 w-full ${showAdditionalFields ? 'pr-8' : 'pr-0'}`}>
                                <div className='space-y-4'>
                                    <FilePathInput 
                                        ref={fileInputRef}
                                        componentHeader="Video File"
                                        placeholderText="C:\Users\YourUsername\Documents\video.mp4..."
                                        defaultDisplayText="Enter a valid .avi video file path."
                                        browseIcon={<FaPaperclip className="w-3/4 h-3/4 transform -rotate-45"/>}
                                        browseHandler={window.electron.openEncryptedFilePath}
                                        onValueChange={setFilepaths}
                                        onValidityChange={setFilepathValidity}
                                        isRequired={true}
                                        allowMultiple={true}
                                        isEnabled={showAdditionalFields ? false : true}
                                    />
                                    <FilePathInput
                                        ref={outputDirpathInputRef}
                                        componentHeader="Decrypted Video File Destination"
                                        defaultDisplayText="Enter a valid directory path."
                                        placeholderText="C:\Users\YourUsername\Documents\DecryptedVideoDest..."
                                        browseIcon={<FaFolder className="w-3/4 h-3/4 transform "/>}
                                        browseHandler={window.electron.openFolder}
                                        onValueChange={setOutputDirpath}
                                        onValidityChange={setOutputDirpathValidity}
                                        isRequired={false}
                                        isEnabled={showAdditionalFields ? false : true}
                                    />
                                </div>
                            </div>
                            <div className={`flex-shrink-0 w-full ${showAdditionalFields ? 'pl-0' : 'pl-8'}`}>
                                <div className='space-y-4'>
                                    <PasswordInput
                                        ref={passwordInputRef}
                                        componentHeader="Hash Key Password"
                                        defaultDisplayText="Ensure the password matches the one you provided earlier for encryption."
                                        placeholderText="e.g. ILoveM3d!Crypt143"
                                        processType="Decrypt"
                                        onValueChange={setPassword}
                                        onValidityChange={setPasswordValidity}
                                        isEnabled={showAdditionalFields ? true : false}
                                    />
                                    <FilePathInput
                                        ref={hashInputRef}
                                        componentHeader="Hash Key File"
                                        placeholderText="C:\Users\YourUsername\Documents\HashKey.key..."
                                        defaultDisplayText="Enter a valid .key file path."
                                        browseIcon={<FaPaperclip className="w-3/4 h-3/4 transform -rotate-45"/>}
                                        browseHandler={window.electron.openHashKeyPath}
                                        onValueChange={setHashPath}
                                        onValidityChange={setHashPathValidity}
                                        isRequired={true}
                                        allowMultiple={true}
                                        allowMultipleText1={".key files"}
                                        allowMultipleText2={"encrypted videos"}
                                        dependencyList={filepaths}
                                        isEnabled={showAdditionalFields ? true : false}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='flex justify-between'>
                            <ProcessButton
                                className={`w-40 h-14`}
                                buttonText="Prev"
                                buttonIcon={FaChevronCircleLeft}
                                iconLocation='left'
                                isEnabled={showAdditionalFields ? true : false}
                                onClickFunction={showPreviousFields}
                            />
                            <ProcessButton
                                className={`w-40 h-14`}
                                buttonText={`${showAdditionalFields ? "Decrypt" : "Next"}`}
                                buttonIcon={showAdditionalFields ? FaLock : FaChevronCircleRight}
                                iconLocation={showAdditionalFields ? 'left' : 'left'}
                                onClickFunction={processInputData}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default Decrypt;
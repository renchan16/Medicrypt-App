/**
 * FilePathInput Component
 *
 * The `FilePathInput` component provides a user interface for inputting file paths, 
 * including support for multiple file paths. It allows users to browse for files 
 * and handles input validation, displaying relevant messages based on the validity 
 * of the input. This component is designed to enhance the user experience by 
 * providing a clear and interactive method for file path selection.
 *
 * Props:
 * -------
 * @param {string} className - Additional CSS class names for custom styling of the component.
 * @param {string} componentHeader - The header text displayed above the input field.
 * @param {string} placeholderText - Placeholder text shown within the input field.
 * @param {string} defaultDisplayText - Default message displayed to the user regarding the input.
 * @param {ReactNode} browseIcon - The icon displayed in the browse button.
 * @param {Function} browseHandler - Function that handles the file browsing action and 
 *                                    returns the selected file path(s).
 * @param {Function} onValueChange - Callback function invoked when the file path changes, 
 *                                    receiving the new value as an argument.
 * @param {Function} onValidityChange - Callback function invoked to notify the parent 
 *                                       component of the validity state of the input.
 * @param {Array} dependencyList - An array of dependencies used in input validation.
 * @param {boolean} allowMultiple - Flag indicating whether multiple file paths are allowed.
 * @param {string} allowMultipleText1 - Message displayed when multiple paths are allowed.
 * @param {string} allowMultipleText2 - Message displayed when multiple paths are invalid.
 * @param {boolean} isRequired - Indicates if the input is required.
 * @param {boolean} isEnabled - Flag indicating whether the input is enabled or disabled.
 *
 * State:
 * -------
 * @state {string} path - The current value of the file path input.
 * @state {string | string[]} processedPath - The processed value(s) of the input based on 
 *                                             whether multiple paths are allowed.
 * @state {boolean} isInitialLoad - Indicates if the input is in its initial load state.
 * @state {boolean} isInputActive - Tracks whether the input is currently active.
 * @state {boolean} isFocused - Tracks whether the input field is focused.
 * @state {boolean} isValidInput - Indicates if the current input is valid based on 
 *                                 validation rules.
 * @state {string} inputMessage - Message to display regarding the validity of the input.
 *
 * Effects:
 * ---------
 * - The `useEffect` hook is used to notify the parent component of input validity changes 
 *   whenever `isValidInput` changes.
 * - The `useImperativeHandle` hook exposes a `validate` function to parent components 
 *   for manual validation.
 *
 * Event Handlers:
 * ----------------
 * - handleBrowsePath: Invokes the `browseHandler` to allow users to select files, 
 *                     processes the selected paths, and updates the component's state.
 * - handleInputChange: Updates the state based on user input, processes the input, 
 *                      and triggers validation.
 * - handleFocus: Updates focus state when the input is focused.
 * - handleBlur: Validates the input when the input loses focus.
 * - handleInputValidation: Validates the processed file path(s) using the 
 *                         `ValidateFilePath` utility function.
 *
 * Usage:
 * ------
 * The `FilePathInput` component can be used in forms where users need to input 
 * file paths for processing, such as during file upload or data import operations.
 *
 * Example:
 * -------
 * <FilePathInput 
 *   className="my-custom-class"
 *   componentHeader="Select File(s)"
 *   placeholderText="Enter or browse file path(s)"
 *   defaultDisplayText="Please provide a valid file path."
 *   browseIcon={<YourIconComponent />}
 *   browseHandler={yourBrowseFunction}
 *   onValueChange={(paths) => console.log(paths)}
 *   onValidityChange={(isValid) => console.log(isValid)}
 *   allowMultiple={true}
 *   isRequired={true}
 *   isEnabled={true}
 * />
 *
 * Dependencies:
 * -------------
 * - React: Core library for component rendering.
 * - useState, useEffect, useImperativeHandle, forwardRef: React hooks for state management, 
 *   lifecycle events, and ref handling.
 * - ValidateFilePath: Utility function for validating file paths.
 * - react-icons: Library for icons used to indicate input validity.
 *
 * Code Author:
 * ------------
 * - Charles Andre C. Bandala, Renz Carlo T. Caritativo
 * 
 * Date Created: 9/15/2024
 * Last Modified: 11/11/2024
 */

import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { ValidateFilePath } from "../../utils/FilePathValidator";
import { CiCircleInfo, CiCircleAlert } from "react-icons/ci";

const FilePathInput = forwardRef(({ 
    className, 
    componentHeader, 
    placeholderText, 
    defaultDisplayText, 
    browseIcon, 
    browseHandler, 
    onValueChange, 
    onValidityChange, 
    dependencyList = [], 
    allowMultiple = false, 
    allowMultipleText1="", 
    allowMultipleText2="", 
    isRequired, 
    isEnabled = true 
}, ref) => {

    const [path, setFilePath] = useState("");
    const [processedPath, setProcessedPath] = useState(allowMultiple ? [] : "");
    const [isInitialLoad, setInitialLoad] = useState(true);
    const [isInputActive, setInputActive] = useState(false);
    const [isFocused, setFocus] = useState(false);
    const [isValidInput, setInputValidity] = useState(isRequired ? false : true); 
    const [inputMessage, setInputMessage] = useState(defaultDisplayText);

    // For changing the validity of the inputted value
    useEffect(() => {
        onValidityChange(isValidInput);
    }, [isValidInput, onValidityChange]);

    // For validating in external components.
    useImperativeHandle(ref, () => ({
        validate() {
            handleInputValidation(processedPath);
        }
    }));

    // Handle the opening of the file dialog.
    const handleBrowsePath = async () => {
        const uploadedPath = await browseHandler();
        if (uploadedPath) {
            setInitialLoad(false);
            setFilePath(uploadedPath);
            const processed = allowMultiple ? (Array.isArray(uploadedPath) ? uploadedPath : [uploadedPath]) : uploadedPath;
            setProcessedPath(processed);
            onValueChange(processed);
            handleInputValidation(processed);
        }
    };

    // Handle input change for the field in UI. 
    const handleInputChange = (e) => {
        setInitialLoad(false);
        const inputValue = e.target.value;
        setFilePath(inputValue);
        
        let processed;
        if (allowMultiple) {
            processed = inputValue.split(',').map(item => item.trim()).filter(item => item !== '');
        } else {
            processed = inputValue;
        }
        
        setProcessedPath(processed);
        onValueChange(processed);
        handleInputValidation(processed);
    };

    // Handle the focusing of the input field 
    const handleFocus = () => {
        setInputActive(true);
        setFocus(true);
    }

    // Handle the unfocusing of the input field
    const handleBlur = () => {
        setInitialLoad(false);
        setInputActive(path !== "");
        setFocus(false);
        handleInputValidation(processedPath);
    }
    
    // Handles the validation of the input. 
    const handleInputValidation = async (filePath) => {
        const isValid = await ValidateFilePath(
            filePath, 
            defaultDisplayText, 
            allowMultiple, 
            allowMultipleText1, 
            allowMultipleText2, 
            dependencyList, 
            isRequired
        );
        setInitialLoad(false);
        setInputValidity(isValid['inputValidity']);
        setInputMessage(isValid['inputMessage']);
    }

    return (
        <div className={`${className} snap-center`}>
            <div className="relative flex items-center">
                <input 
                    type='text' 
                    id="file-path-input"
                    placeholder={placeholderText}
                    value={path} 
                    className={`
                        w-full 
                        px-3 
                        pt-7 
                        pb-3 
                        rounded-xl 
                        bg-transparent 
                        text-sm 
                        text-black 
                        font-normal 
                        placeholder:font-normal 
                        border-2 
                        ${isValidInput || isInitialLoad ? "border-primary2" : "border-red-900"} 
                        focus:border-primary1  
                        focus:outline-none 
                        ${isFocused ? 'placeholder:text-primary2' : 'placeholder:text-transparent'} 
                        transition-all duration-300
                    `} 
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled = {!isEnabled}
                />
                <label 
                    htmlFor="file-path-input"
                    className={`
                        absolute 
                        left-3 
                        font-medium 
                        transition-all 
                        duration-200 
                        ${isInputActive || path ? 
                            'text-xs top-4 leading-tight' : 
                            'text-base top-1/2 -translate-y-1/2'
                        } 
                        ${isFocused ? 'text-primary1' : 'text-primary2'} 
                        pointer-events-none
                    `}
                >
                    {componentHeader}
                </label>
                <button 
                    className={`
                        absolute 
                        w-6 
                        h-6 
                        right-4 
                        text-primary2 
                        hover:text-primary1 
                        transition-colors duration-300
                    `}
                    onClick={handleBrowsePath} 
                    tabindex="-1">
                    {browseIcon}
                </button>
            </div>
            <p 
                className={`
                    mt-1 
                    flex 
                    items-center 
                    gap-1 
                    ${isValidInput || isInitialLoad ? 
                        "font-base text-gray-600" : 
                        "font-semibold text-red-900"
                    } 
                    text-sm
                `}>
                {isValidInput || isInitialLoad ? (
                    <CiCircleInfo size={16} />
                ) : (
                    <CiCircleAlert size={16} />
                )}
                <span>{inputMessage}</span>
            </p>
        </div>
    );
});

export default FilePathInput;
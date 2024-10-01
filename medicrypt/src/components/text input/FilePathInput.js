import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { ValidateFilePath } from "../../utils/FilePathValidator";
import { CiCircleInfo, CiCircleAlert } from "react-icons/ci";

const FilePathInput = forwardRef(({ className, componentHeader, placeholderText, defaultDisplayText, browseIcon, browseHandler, onValueChange, onValidityChange, isRequired }, ref) => {
    const [path, setFilePath] = useState("");
    const [isInitialLoad, setInitialLoad] = useState(true);
    const [isInputActive, setInputActive] = useState(false);
    const [isFocused, setFocus] = useState(false);
    const [isValidInput, setInputValidity] = useState(isRequired ? false : true); 
    const [inputMessage, setInputMessage] = useState(defaultDisplayText);

    useEffect(() => {
        // Notify the parent component about the validity whenever it changes
        onValidityChange(isValidInput);
    }, [isValidInput, onValidityChange]);

    useImperativeHandle(ref, () => ({
        // Function to validate current input using parent.
        validate() {
            handleInputValidation(path);
        }
    }));

    // Handle the change in the input field and file path return value upon choosing a file path using the browse function.
    const handleBrowsePath = async () => {
        const uploadedPath = await browseHandler();
        if (uploadedPath) {
            setInitialLoad(false);
            setFilePath(uploadedPath);
            onValueChange(uploadedPath);
            handleInputValidation(uploadedPath);
        }
    };

    // Handle the change in the input field and file path return value upon typing in the input field.
    const handleInputChange = (e) => {
        setInitialLoad(false);
        setFilePath(e.target.value);
        onValueChange(e.target.value);
    };

    // Handle the focus animation
    const handleFocus = () => {
        setInputActive(true);
        setFocus(!isFocused);
    }

    // Handle the blur of the input
    const handleBlur = (e) => {
        setInitialLoad(false);
        setInputActive(path !== "");
        setFocus(!isFocused);
        handleInputValidation(e.target.value);
    }
    
    // Handles the checking of input validity.
    const handleInputValidation = async (filePath) => {
        const isValid = await ValidateFilePath(filePath, defaultDisplayText, isRequired);
        
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
                    className= {`w-full px-3 pt-7 pb-3 rounded-xl bg-transparent text-sm text-black font-normal placeholder:font-normal border-2 border-primary2 focus:border-primary1 focus:outline-none ${isFocused ? 'placeholder:text-primary2' : 'placeholder:text-transparent'} transition-all duration-300`} 
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
                <label 
                    htmlFor="file-path-input"
                    className={`absolute left-3 font-medium transition-all duration-200 ${isInputActive || path ? 'text-xs top-4 leading-tight' : 'text-base top-1/2 -translate-y-1/2'} ${isFocused ? 'text-primary1' : 'text-primary2'} pointer-events-none`}
                >
                    {componentHeader}
                </label>
                <button className="absolute w-6 h-6 right-4 text-primary2 hover:text-primary1 transition-colors duration-300" onClick={handleBrowsePath}>
                    {browseIcon}
                </button>
            </div>
            <p className={`mt-1 flex items-center gap-1 ${isValidInput || isInitialLoad ? "font-base text-gray-600" : "font-semibold text-red-900"} text-sm`}>
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
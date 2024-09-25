import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { ValidateFilePath } from "../../utils/FilePathValidator";

const FilePathInput = forwardRef(({ className, componentHeader, placeholderText, browseIcon, browseHandler, onValueChange, onValidityChange, isRequired }, ref) => {
    const [path, setFilePath] = useState("");
    const [isInputActive, setInputActive] = useState(false);
    const [isFocused, setFocus] = useState(false);
    const [isValidInput, setInputValidity] = useState(isRequired ? false : true); 
    const [inputWarning, setInputWarning] = useState("");

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
            setFilePath(uploadedPath);
            onValueChange(uploadedPath);
            handleInputValidation(uploadedPath);
        }
    };

    // Handle the change in the input field and file path return value upon typing in the input field.
    const handleInputChange = (e) => {
        setFilePath(e.target.value);
        onValueChange(e.target.value);
    };

    const handleFocus = () => {
        setInputActive(true);
        setFocus(!isFocused);
    }

    const handleBlur = (e) => {
        setInputActive(path !== "");
        setFocus(!isFocused);
        handleInputValidation(e.target.value);
    }
    
    // Handles the checking of input validity.
    const handleInputValidation = async (filePath) => {
        const isValid = await ValidateFilePath(filePath, isRequired);

        setInputValidity(isValid['inputValidity']);
        setInputWarning(isValid['inputWarning']);
    }

    return (
        <div className={`${className} snap-center`}>
            <div className="relative flex items-center">
                <input 
                    type='text' 
                    id="file-path-input"
                    placeholder={placeholderText}
                    value={path} 
                    className= {`w-full px-3 pt-7 pb-3 rounded-xl bg-transparent text-base text-black font-normal placeholder:font-normal border-2 border-primary2 focus:border-primary1 focus:outline-none ${isFocused ? 'placeholder:text-primary2' : 'placeholder:text-transparent'} transition-all duration-300`} 
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
            <p className={"mt-1 font-semibold text-sm text-red-900"}>{inputWarning}</p>
        </div>
    );
});

export default FilePathInput;
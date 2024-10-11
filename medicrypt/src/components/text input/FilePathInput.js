import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { ValidateFilePath } from "../../utils/FilePathValidator";
import { CiCircleInfo, CiCircleAlert } from "react-icons/ci";

const FilePathInput = forwardRef(({ className, componentHeader, placeholderText, defaultDisplayText, browseIcon, browseHandler, onValueChange, onValidityChange, dependencyList = [], allowMultiple = false, allowMultipleText1="", allowMultipleText2="", isRequired, isEnabled = true }, ref) => {
    const [path, setFilePath] = useState("");
    const [processedPath, setProcessedPath] = useState(allowMultiple ? [] : "");
    const [isInitialLoad, setInitialLoad] = useState(true);
    const [isInputActive, setInputActive] = useState(false);
    const [isFocused, setFocus] = useState(false);
    const [isValidInput, setInputValidity] = useState(isRequired ? false : true); 
    const [inputMessage, setInputMessage] = useState(defaultDisplayText);

    useEffect(() => {
        onValidityChange(isValidInput);
    }, [isValidInput, onValidityChange]);

    useImperativeHandle(ref, () => ({
        validate() {
            handleInputValidation(processedPath);
        }
    }));

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

    const handleFocus = () => {
        setInputActive(true);
        setFocus(true);
    }

    const handleBlur = () => {
        setInitialLoad(false);
        setInputActive(path !== "");
        setFocus(false);
        handleInputValidation(processedPath);
    }
    
    const handleInputValidation = async (filePath) => {
        const isValid = await ValidateFilePath(filePath, defaultDisplayText, allowMultiple, allowMultipleText1, allowMultipleText2, dependencyList, isRequired);
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
                    className={`w-full px-3 pt-7 pb-3 rounded-xl bg-transparent text-sm text-black font-normal placeholder:font-normal border-2 ${isValidInput || isInitialLoad ? "border-primary2" : "border-red-900"} focus:border-primary1  focus:outline-none ${isFocused ? 'placeholder:text-primary2' : 'placeholder:text-transparent'} transition-all duration-300`} 
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled = {!isEnabled}
                />
                <label 
                    htmlFor="file-path-input"
                    className={`absolute left-3 font-medium transition-all duration-200 ${isInputActive || path ? 'text-xs top-4 leading-tight' : 'text-base top-1/2 -translate-y-1/2'} ${isFocused ? 'text-primary1' : 'text-primary2'} pointer-events-none`}
                >
                    {componentHeader}
                </label>
                <button className="absolute w-6 h-6 right-4 text-primary2 hover:text-primary1 transition-colors duration-300" onClick={handleBrowsePath} tabindex="-1">
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
import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { ValidatePassword } from "../../utils/PasswordValidator";
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icons for show/hide password
import { CiCircleInfo, CiCircleAlert } from "react-icons/ci";

const PasswordInput = forwardRef(({className, componentHeader, placeholderText, defaultDisplayText, processType, onValueChange, onValidityChange}, ref) => {
    const [isInputActive, setInputActive] = useState(false);
    const [isInitialLoad, setInitialLoad] = useState(true);
    const [isFocused, setFocus] = useState(false);
    const [password, setPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isValidInput, setInputValidity] = useState(false); 
    const [inputWarning, setInputWarning] = useState(defaultDisplayText);

    useEffect(() => {
        // Notify the parent component about the validity whenever it changes
        onValidityChange(isValidInput);
    }, [isValidInput, onValidityChange]);

    useImperativeHandle(ref, () => ({
        // Function to validate current input using parent.
        validate() {
            handleInputValidation(password);
        }
    }));

    // Handles the input change upon user input.
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInitialLoad(false);
        setPassword(newValue);
        onValueChange(newValue);
        handleInputValidation(newValue);
    };

    // Handles the focus for the input field animations.
    const handleFocus = () => {
        setInputActive(true);
        setFocus(!isFocused);
    }

    // Handles the onBlur event for the input field.
    const handleBlur = (e) => {
        setInitialLoad(false);
        setInputActive(password !== "");
        setFocus(!isFocused);
        handleInputValidation(e.target.value);
    };
    
    const handleInputValidation = (password) => {
        const validate = ValidatePassword(password);
        
        setInitialLoad(false);
        // Checks the validity of the password based on process type
        if(processType === "Encrypt"){
            if (password === null || password === "") {
                setInputWarning("This field is required!");
                setInputValidity(false);
            } 
            else if (validate['passwordValidity']) {
                setInputWarning("Great choice! Your password looks good.");
                setInputValidity(validate['passwordValidity']);
            } 
            else {
                setInputWarning(validate['passwordRequirements']);
                setInputValidity(validate['passwordValidity']);
            }
        }
        else if (processType === "Decrypt") {
            if (password === null || password === "") {
                setInputWarning("This field is required!");
                setInputValidity(false);
            }  
            else {
                setInputWarning(defaultDisplayText);
                setInputValidity(true);
            }
        }
    };

    // Toggles the Password Visibility
    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <div className={`${className}`}>
            <div className="relative flex items-center">
                <input
                    type={isPasswordVisible ? 'text' : 'password'}
                    id="password-input"
                    placeholder={placeholderText}
                    value={password}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={`w-full px-3 pt-7 pb-3 rounded-xl bg-transparent text-sm text-black font-normal placeholder:font-normal border-2 border-primary2 focus:border-primary1 focus:outline-none ${isFocused ? 'placeholder:text-primary2' : 'placeholder:text-transparent'} transition-all duration-300`}
                />
                <label 
                    htmlFor="password-input"
                    className={`absolute left-3 font-medium transition-all duration-200 ${isInputActive || password ? 'text-xs top-4 leading-tight' : 'text-base top-1/2 -translate-y-1/2'} ${isFocused ? 'text-primary1' : 'text-primary2'}  pointer-events-none`}
                >
                    {componentHeader}
                </label>
                <button
                    type="button"
                    className="absolute w-6 h-6 right-4 text-xl text-primary2 hover:text-primary1 focus:outline-none transition-colors duration-300"
                    onClick={togglePasswordVisibility}
                >
                    {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>
            <p className={`mt-1 flex items-center gap-1 ${isValidInput || isInitialLoad ? "font-base text-gray-600" : "font-semibold text-red-900"} text-sm`}>
                {isValidInput || isInitialLoad ? (
                    <CiCircleInfo size={16} />
                ) : (
                    <CiCircleAlert size={16} />
                )}
                <span>{inputWarning}</span>
            </p>
        </div>
    );
});

export default PasswordInput;
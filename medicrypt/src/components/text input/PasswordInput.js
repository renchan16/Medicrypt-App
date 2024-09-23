import React, { useState, useEffect } from "react";
import { ValidatePassword } from "../../utils/PasswordValidator";
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icons for show/hide password

export default function PasswordInput({ className, componentHeader, placeholderText, processType, onValueChange, onValidityChange }) {
    const [isInputActive, setInputActive] = useState(false);
    const [isFocused, setFocus] = useState(false);
    const [value, setValue] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isValidInput, setInputValidity] = useState(false); 
    const [passwordWarning, setPasswordWarning] = useState("");

    useEffect(() => {
        // Notify the parent component about the validity whenever it changes
        onValidityChange(isValidInput);
    }, [isValidInput, onValidityChange]);

    // Handles the input change upon user input.
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setValue(newValue);
        onValueChange(newValue);
    };

    // Handles the focus for the input field animations.
    const handleFocus = () => {
        setInputActive(true);
        setFocus(!isFocused);
    }

    // Handles the onBlur event for the input field.
    const handleBlur = (e) => {
        setInputActive(value !== "");
        setFocus(!isFocused);
        handleInputValidation(e.target.value);
    };
    
    const handleInputValidation = (password) => {
        const isValid = ValidatePassword(password)

        // Checks the validity of the password based on process type
        if(processType === "Encrypt"){
            if (password === null || password === "") {
                setPasswordWarning("Password is required");
                setInputValidity(false);
            } 
            else if (isValid) {
                setPasswordWarning(null);
                setInputValidity(true);
            } 
            else {
                setPasswordWarning("Invalid Password");
                setInputValidity(false);
            }
        }
        else if (processType === "Decrypt") {
            if (password === null || password === "") {
                setPasswordWarning("Password is required");
                setInputValidity(false);
            }  
            else {
                setPasswordWarning(null);
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
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={`w-full px-3 pt-7 pb-3 rounded-xl bg-transparent text-base text-black font-normal placeholder:font-normal border-2 border-primary2 focus:border-primary1 focus:outline-none ${isFocused ? 'placeholder:text-primary2' : 'placeholder:text-transparent'} transition-all duration-300`}
                />
                <label 
                    htmlFor="password-input"
                    className={`absolute left-3 font-medium transition-all duration-200 ${isInputActive || value ? 'text-xs top-4 leading-tight' : 'text-base top-1/2 -translate-y-1/2'} ${isFocused ? 'text-primary1' : 'text-primary2'}  pointer-events-none`}
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
            <p className={"mt-1 font-semibold text-sm text-red-900"}>{passwordWarning}</p>
        </div>
    );
}
import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { ValidatePassword } from "../../utils/PasswordValidator";
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icons for show/hide password
import { CiCircleInfo, CiCircleAlert } from "react-icons/ci";

/**
 * PasswordInput Component
 *
 * The `PasswordInput` component provides a user interface for entering and validating 
 * password inputs. It features a show/hide password toggle and displays relevant 
 * messages based on the validity of the password. This component enhances user 
 * experience by ensuring users can input secure passwords while receiving real-time 
 * feedback on their password strength.
 *
 * Props:
 * -------
 * @param {string} className - Additional CSS class names for custom styling of the component.
 * @param {string} componentHeader - The header text displayed above the input field.
 * @param {string} placeholderText - Placeholder text shown within the input field.
 * @param {string} defaultDisplayText - Default message displayed to the user regarding the input.
 * @param {string} processType - Specifies the context of the password input ("Encrypt" or "Decrypt").
 * @param {Function} onValueChange - Callback function invoked when the password value changes, 
 *                                    receiving the new value as an argument.
 * @param {Function} onValidityChange - Callback function invoked to notify the parent 
 *                                       component of the validity state of the input.
 * @param {boolean} isEnabled - Flag indicating whether the input is enabled or disabled.
 *
 * State:
 * -------
 * @state {string} password - The current value of the password input.
 * @state {boolean} isPasswordVisible - Indicates whether the password is currently visible.
 * @state {boolean} isValidInput - Indicates if the current input is valid based on 
 *                                 validation rules.
 * @state {string} inputWarning - Message to display regarding the validity of the input.
 * @state {boolean} isInputActive - Tracks whether the input is currently active.
 * @state {boolean} isInitialLoad - Indicates if the input is in its initial load state.
 * @state {boolean} isFocused - Tracks whether the input field is focused.
 *
 * Effects:
 * ---------
 * - The `useEffect` hook is used to notify the parent component of input validity changes 
 *   whenever `isValidInput` changes.
 * - The `useImperativeHandle` hook exposes a `validate` function to parent components 
 *   for manual validation of the password.
 *
 * Event Handlers:
 * ----------------
 * - handleInputChange: Updates the state based on user input, triggers validation, 
 *                      and notifies the parent component.
 * - handleFocus: Updates focus state when the input is focused.
 * - handleBlur: Validates the input when the input loses focus.
 * - handleInputValidation: Validates the password input using the `ValidatePassword` utility function.
 * - togglePasswordVisibility: Toggles the visibility of the password input.
 *
 * Usage:
 * ------
 * The `PasswordInput` component can be used in forms where users need to enter passwords 
 * for encryption or decryption processes, ensuring that users can create strong passwords.
 *
 * Example:
 * -------
 * <PasswordInput 
 *   className="my-password-input"
 *   componentHeader="Enter Password"
 *   placeholderText="Your password"
 *   defaultDisplayText="Password must meet requirements."
 *   processType="Encrypt"
 *   onValueChange={(password) => console.log(password)}
 *   onValidityChange={(isValid) => console.log(isValid)}
 *   isEnabled={true}
 * />
 *
 * Dependencies:
 * -------------
 * - React: Core library for component rendering.
 * - useState, useEffect, useImperativeHandle, forwardRef: React hooks for state management, 
 *   lifecycle events, and ref handling.
 * - ValidatePassword: Utility function for validating password strength.
 * - react-icons: Library for icons used in the input field.
 *
 * Code Author:
 * ------------
 * - Charles Andre C. Bandala, Renz Carlo T. Caritativo
 */

const PasswordInput = forwardRef(({className, componentHeader, placeholderText, defaultDisplayText, processType, onValueChange, onValidityChange, isEnabled = true}, ref) => {
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
    
    // Handle validation of password inputs
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
                    className={`w-full px-3 pt-7 pb-3 rounded-xl bg-transparent text-sm text-black font-normal placeholder:font-normal border-2 ${isValidInput || isInitialLoad ? "border-primary2" : "border-red-900"} focus:border-primary1 focus:outline-none ${isFocused ? 'placeholder:text-primary2' : 'placeholder:text-transparent'} transition-all duration-300`}
                    disabled = {!isEnabled}
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
                    tabindex="-1"
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
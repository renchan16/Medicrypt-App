import React, { useState } from "react";
import { ValidatePassword } from "../../utils/PasswordValidation";
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icons for show/hide password

export default function PasswordInput({ className, componentHeader, placeholderText, onValueChange }) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [passwordWarning, setPasswordWarning] = useState("");

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const handleInputChange = (e) => {
        onValueChange(e.target.value);

        // Set password warning to null if no password is entered.
        if(e.target.value === null || e.target.value === ""){
            setPasswordWarning(null);
            return;
        }
        
        // Set the password warning that is necessary.
        if(ValidatePassword(e.target.value)) {
            setPasswordWarning("You're all set!");
        }
        else {
            setPasswordWarning("Invalid Password!");
        }
    };

    return (
        <div className={`${className}`}>
            <h1 className="mb-1 font-semibold text-base text-primary1">{componentHeader}</h1>
            <div className="relative flex items-center">
                <input
                    type={isPasswordVisible ? 'text' : 'password'}
                    placeholder={placeholderText}
                    className='w-full rounded-xl bg-transparent text-sm border-2 border-primary2 placeholder-primary2 placeholder-opacity-100 focus:border-primary1 focus:placeholder-primary2 focus:outline-none transition-all duration-300'
                    onChange={handleInputChange}
                    />
                <button
                    type="button"
                    className="absolute right-5 text-xl text-primary2 hover:text-primary1 focus:outline-none transition-colors duration-300"
                    onClick={togglePasswordVisibility}
                >
                    {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>
            <p className={"mt-1 font-semibold text-sm text-red-900"}>{passwordWarning}</p>
        </div>
    );
}

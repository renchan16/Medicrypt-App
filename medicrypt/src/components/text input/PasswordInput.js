import React, { useState } from "react";
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icons for show/hide password

export default function PasswordInput({ className, placeholderText, onValueChange }) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const handleInputChange = (e) => {
        onValueChange(e.target.value);
    };

    return (
        <div className={`relative flex items-center ${className}`}>
            <input
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder={placeholderText}
                className='w-full rounded-xl bg-transparent text-sm border-2 border-primary2 placeholder-primary1 placeholder-opacity-100 placeholder:font-semibold focus:border-primary1 focus:placeholder-primary2 focus:outline-none transition-all duration-300'
                onChange={handleInputChange}
            />
            <button
                type="button"
                className="absolute right-5 text-xl text-primary1 focus:outline-none"
                onClick={togglePasswordVisibility}
            >
                {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </button>
        </div>
    );
}

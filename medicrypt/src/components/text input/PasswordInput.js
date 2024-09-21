import React, { useState } from "react";

export default function PasswordInput( {className, placeholderText, onValueChange} ){

    const handleInputChange = (e) => {
        onValueChange(e.target.value);
    }
    
    return (
        <div className={`relative flex items-center ${className}`}>
            <input 
                type='password' 
                placeholder={placeholderText}
                className='w-full rounded-xl bg-transparent text-sm border-2 border-primary2 placeholder-primary1 placeholder-opacity-100 placeholder:font-semibold focus:border-primary1 focus:placeholder-primary2 focus:outline-none transition-all duration-300' 
                onChange={handleInputChange}
                />
        </div>
    );
}
import React, { useState } from "react";

export default function PasswordInput( {className, onPasswordChange} ){

    const handlePasswordChange = (e) => {
        onPasswordChange(e.target.value);
    }
    
    return (
        <div className={`relative flex items-center ${className}`}>
            <input 
                type='password' 
                placeholder='Enter a password' 
                className='w-full rounded-xl bg-transparent text-sm border-2 border-primary2  placeholder:bold placeholder-primary1 placeholder-opacity-100 focus:border-primary1 focus:placeholder-primary2 focus:outline-none transition-all duration-300' 
                onChange={handlePasswordChange}></input>
        </div>
    );
}
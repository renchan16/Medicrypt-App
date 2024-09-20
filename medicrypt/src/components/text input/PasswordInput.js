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
                className='w-full rounded-xl bg-transparent text-sm border-2 border-primary1 placeholder:bold placeholder-primary1 placeholder-opacity-100' 
                onChange={handlePasswordChange}></input>
        </div>
    );
}
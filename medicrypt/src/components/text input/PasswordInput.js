import React, { useState } from "react";

export default function PasswordInput( {className, onPasswordChange} ){

    const handlePasswordChange = (e) => {
        onPasswordChange(e.target.value);
    }
    
    return (
        <div className={`relative flex items-center ${className}`}>
            <input type='password' placeholder='Enter a password' className='w-full rounded-xl bg-primary-light text-sm' onChange={handlePasswordChange}></input>
        </div>
    );
}
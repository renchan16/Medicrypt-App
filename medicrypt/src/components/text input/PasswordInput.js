import React from "react";

export default function PasswordInput( {className} ){
    return (
        <div className={`relative w-full h-full flex items-center ${className}`}>
            <input type='text' placeholder='Enter a password' className='w-full h-full rounded-xl bg-primary-light text-sm'></input>
        </div>
    );
}
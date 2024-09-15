import React from "react";

export default function FilepathInput( {className} ){
    return (
        <div className={`relative w-full h-full flex items-center ${className}`}>
            <input type='text' placeholder='Enter file path or click the button' className='w-full h-full rounded-xl bg-primary-light text-sm'></input>
            <button className="absolute w-10 h-10 rounded-lg bg-black right-3"></button>
        </div>
    );
}


import React, { useState } from "react";

export default function FilePathInput( {className, placeholderText, browseIcon, browseHandler, onValueChange} ){
    const [path, setFilePath] = useState("");

    // Handle the change in the input field and file path return value upon choosing a file path using the browse function.
    const handleBrowsePath = async () => {
        const uploadedPath = await browseHandler();
        if (uploadedPath) {
            setFilePath(uploadedPath);
            onValueChange(uploadedPath);
        }
    };

    // Handle the change in the input field and file path return value upon typing in the input field.
    const handleInputChange = (e) => {
        setFilePath(e.target.value);
        onValueChange(e.target.value);
    };
    
    return (
        <div className={`relative flex items-center ${className}`}>
            <input 
                type='text' 
                value={path} 
                placeholder={placeholderText} 
                className='w-full rounded-xl bg-transparent text-sm border-2 border-primary2 placeholder-primary1 placeholder-opacity-100 placeholder:font-semibold focus:border-primary1 focus:placeholder-primary2 focus:outline-none transition-all duration-300' 
                onChange={handleInputChange} 
                />
            <button className="absolute w-6 h-6 right-4 rounded-lg text-primary1" onClick={handleBrowsePath}>
                {browseIcon}
            </button>
        </div>
    );
}


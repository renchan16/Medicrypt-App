import React, { useState } from "react";
import { FaPaperclip } from "react-icons/fa6";

export default function FilePathInput( {className, placeholder, onFilePathChange} ){
    const [path, setFilePath] = useState(""); // State to hold the path path

    const handleFilePathChange = async () => {
        const uploadedPath = await window.electron.openFilePath(); // Get the uploaded path
        if (uploadedPath) {
            setFilePath(uploadedPath); // Set the path name in the state
            onFilePathChange(uploadedPath); // Call the onFilePathChange function with the uploaded path
        }
    };

    const handleInputChange = (e) => {
        setFilePath(e.target.value);  // Update the state with the typed value
        onFilePathChange(e.target.value); // Optionally pass the typed value to the parent component
    };
    
    return (
        <div className={`relative flex items-center ${className}`}>
            <input 
                type='text' 
                value={path} 
                placeholder={`${placeholder}`} 
                className='w-full rounded-xl bg-transparent text-sm  border-2 border-primary2 placeholder-primary1 placeholder-opacity-100 focus:border-primary1 focus:placeholder-primary2 focus:outline-none transition-all duration-300' 
                onChange={handleInputChange}></input>
            <button className="absolute w-6 h-6 rounded-lg right-4" onClick={handleFilePathChange}>
                <FaPaperclip className="w-full h-full transform -rotate-45"/>
            </button>
        </div>
    );
}


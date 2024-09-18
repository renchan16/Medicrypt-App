import React, { useState } from "react";
import { FaPaperclip } from "react-icons/fa6";

export default function FileInput( {className, placeholder, onFileChange} ){
    const [file, setFile] = useState(""); // State to hold the file path

    const handleFileChange = async () => {
        const uploadedFile = await window.electron.openFile();; // Get the uploaded file
        if (uploadedFile) {
            setFile(uploadedFile); // Set the file name in the state
            onFileChange(uploadedFile); // Call the onFileChange function with the uploaded file
        }
    };

    const handleInputChange = (e) => {
        setFile(e.target.value);  // Update the state with the typed value
        onFileChange(e.target.value); // Optionally pass the typed value to the parent component
    };
    
    return (
        <div className={`relative flex items-center ${className}`}>
            <input 
                type='text' 
                value={file} 
                placeholder={`${placeholder}`} 
                className='w-full rounded-xl bg-transparent text-sm border-2 border-primary2  placeholder:bold placeholder-primary1 placeholder-opacity-100 focus:border-primary1 focus:placeholder-primary2 focus:outline-none transition-all duration-300' 
                onChange={handleInputChange}></input>
            <button className="absolute w-6 h-6 rounded-lg right-4" onClick={handleFileChange}>
                <FaPaperclip className="w-full h-full transform -rotate-45"/>
            </button>
        </div>
    );
}


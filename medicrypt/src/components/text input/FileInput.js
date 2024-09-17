import React, { useState } from "react";

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
            <input type='text' value={file} placeholder={`${placeholder}`} className='w-full rounded-xl bg-primary-light text-sm' onChange={handleInputChange}></input>
            <button className="absolute w-10 h-10 rounded-lg bg-black right-3" onClick={handleFileChange}></button>
        </div>
    );
}


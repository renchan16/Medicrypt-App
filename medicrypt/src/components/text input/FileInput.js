import React, { useState } from "react";

export default function FileInput( {className, placeholder, onFileChange} ){
    const [file, setFile] = useState(""); // State to hold the file path

    const handleFileChange = (e) => {
        const uploadedFile = e.target.files[0]; // Get the uploaded file
        if (uploadedFile) {
            setFile(uploadedFile.name); // Set the file name in the state
            onFileChange(uploadedFile); // Call the onFileChange function with the uploaded file
        }
    };
    
    return (
        <div className={`relative flex items-center ${className}`}>
            <input type='text' value={file} placeholder={`${placeholder}`} className='w-full rounded-xl bg-primary-light text-sm' readOnly></input>
            <input type="file" id="file" hidden onChange={handleFileChange} accept="video/*"/>
            <label htmlFor="file" className="absolute w-10 h-10 rounded-lg bg-black right-3"></label>
        </div>
    );
}


import React, { useState, useEffect } from "react";

export default function AlgorithmSelector({ className, componentHeader, optionOne, optionTwo, onValueChange }) {
    const [selectedAlgo, setSelectedAlgo] = useState(optionOne);

    // Sets the value of the selectedAlgo upon runtime and every time its value changes.
    useEffect(() => {
        onValueChange(selectedAlgo);
    }, [selectedAlgo]);

    // Handles the change in the switch UI whenever toggled to match the chosen algorithm.
    const handleValueChange = (event) => {
        setSelectedAlgo(event.target.checked ? optionTwo : optionOne);
    };

    return (
        <div className={`${className}`}>
            <h1 className="text-sm text-secondary font-semibold">{componentHeader}</h1>
            <label className={`relative flex items-center w-72 h-8 mt-1 overflow-hidden rounded-lg border cursor-pointer 
                ${selectedAlgo === optionOne ? 'border-secondary bg-transparent' : 'bg-transparent border-secondary'}`}>
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={selectedAlgo === optionTwo}
                    onChange={handleValueChange}
                />
                <span className={`absolute w-1/2 h-full rounded-lg bg-secondary transition-all duration-300 transform 
                    ${selectedAlgo === optionTwo ? "translate-x-full" : ""}`}></span>
                <div className="relative flex justify-between items-center w-full">
                    <p className={`w-1/2 text-center font-bold text-sm 
                        ${selectedAlgo === optionOne ? 'text-white' : 'text-secondary'} select-none transition-colors duration-300`}>
                        {optionOne}
                    </p>
                    <p className={`w-1/2 text-center font-bold text-sm 
                        ${selectedAlgo === optionTwo ? 'text-white' : 'text-secondary'} select-none transition-colors duration-300`}>
                        {optionTwo}
                    </p>
                </div>
            </label>
        </div>
    );
}

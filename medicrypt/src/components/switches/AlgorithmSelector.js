import React, { useState, useEffect } from "react";

export default function AlgorithmSelector({ className, componentHeader, optionOne, optionTwo, onValueChange }) {
    const [selectedAlgo, setSelectedAlgo] = useState({optionOne});

    // Sets the value of the selectedAlgo upon runtime and everytime its value changes.
    useEffect(() => {
        onValueChange(selectedAlgo);
    }, [selectedAlgo]);

    // Handles the change in the switch UI whenever toggled to match the chosen algorithm.
    const handleValueChange = (event) => {
        setSelectedAlgo(event.target.checked ? optionTwo : optionOne);
    };

    return (
        <div className={`${className}`}>
            <h1 className="text-sm text-primary1 font-normal">{componentHeader}</h1>
            <label className="relative flex items-center w-60 h-8 mt-1 overflow-hidden rounded-lg bg-primary2 cursor-pointer">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={selectedAlgo === optionTwo}
                    onChange={handleValueChange}
                    />
                <span className={`absolute w-1/2 h-full rounded-lg bg-primary1 transition-transform duration-300 transform ${selectedAlgo === optionTwo ? "translate-x-full" : ""}`}></span>
                <div className="relative flex justify-between items-center w-full">
                    <p className={`w-1/2 text-center font-bold text-sm text-white select-none transition-colors duration-300 `}>{optionOne}</p>
                    <p className={`w-1/2 text-center font-bold text-sm text-white select-none transition-colors duration-300 `}>{optionTwo}</p>
                </div>
            </label>
        </div>
    );
}
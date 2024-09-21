import React, { useState, useEffect } from "react";

export default function AlgoSwitch({ className, onAlgorithmChange }) {
    const [selectedAlgo, setSelectedAlgo] = useState("FY-Logistic");

    useEffect(() => {
        onAlgorithmChange(selectedAlgo);
    }, []);

    const handleChange = (event) => {
        setSelectedAlgo(event.target.checked ? "3D Cosine" : "FY-Logistic");
        onAlgorithmChange(selectedAlgo);
    };

    return (
        <div className={`${className}`}>
            <h2 className="text-sm font-semibold text-primary1">Choose an Encryption Algorithm</h2>
            <label htmlFor="algo" className="mt-1 w-2/6 h-3/6 relative bg-primary2 rounded-lg cursor-pointer flex items-center overflow-hidden">
                <input
                    type="checkbox"
                    id="algo"
                    className="sr-only peer"
                    checked={selectedAlgo === "3D Cosine"}
                    onChange={handleChange}
                />
                <span className={`absolute w-1/2 h-full bg-primary1 rounded-lg  transition-transform duration-300 transform ${selectedAlgo === "3D Cosine" ? "translate-x-full" : ""}`}></span>
                <div className="relative w-full flex justify-between items-center">
                    <p className={`w-1/2 text-center font-bold text-sm transition-colors duration-300 text-white select-none`}>FY-Logistic</p>
                    <p className={`w-1/2 text-center font-bold text-sm transition-colors duration-300 text-white select-none`}>3D Cosine</p>
                </div>
            </label>
        </div>
    );
}
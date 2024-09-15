import React, { useState } from "react";

export default function AlgoSwitch({ className }) {
    const [selectedAlgo, setSelectedAlgo] = useState("FY-Logistic");

    const handleChange = (event) => {
        setSelectedAlgo(event.target.checked ? "3D Cosine" : "FY-Logistic");
    };

    return (
        <div className={`${className}`}>
            <h2 className="text-sm font-semibold text-white">Choose an Encryption Algorithm</h2>
            <label htmlFor="algo" className="mt-1 w-60 h-8 relative bg-white rounded-lg cursor-pointer flex items-center overflow-hidden">
                <input
                    type="checkbox"
                    id="algo"
                    className="sr-only peer"
                    checked={selectedAlgo === "3D Cosine"}
                    onChange={handleChange}
                />
                <span className={`absolute w-1/2 h-full bg-primary-light  transition-transform duration-300 transform ${selectedAlgo === "3D Cosine" ? "translate-x-full" : ""}`}></span>
                <div className="relative w-full flex justify-between items-center">
                    <p className={`w-1/2 text-center font-bold text-sm transition-colors duration-300 ${selectedAlgo === "FY-Logistic" ? "text-white" : "text-black"} select-none`}>FY-Logistic</p>
                    <p className={`w-1/2 text-center font-bold text-sm transition-colors duration-300 ${selectedAlgo === "3D Cosine" ? "text-white" : "text-black"} select-none`}>3D Cosine</p>
                </div>
            </label>
        </div>
    );
}
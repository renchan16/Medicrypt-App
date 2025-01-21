/**
 * AlgorithmSelector Component
 *
 * The `AlgorithmSelector` component allows users to select between two algorithms 
 * using a toggle switch. It manages the state of the selected algorithm and 
 * communicates changes to the parent component via a callback function. This 
 * component enhances user experience by providing a clear and interactive way 
 * to choose between algorithm options.
 *
 * Props:
 * -------
 * @param {string} className - Additional CSS class names to apply to the component for styling.
 * @param {string} componentHeader - The header text displayed above the toggle switch, indicating 
 *                                   the purpose of the selection.
 * @param {string} optionOne - The label for the first algorithm option.
 * @param {string} optionTwo - The label for the second algorithm option.
 * @param {Function} onValueChange - Callback function invoked when the selected algorithm changes, 
 *                                    receiving the new value as an argument.
 *
 * State:
 * -------
 * @state {string} selectedAlgo - The currently selected algorithm, initialized to `optionOne`.
 *
 * Effects:
 * ---------
 * - The `useEffect` hook is used to trigger the `onValueChange` callback whenever `selectedAlgo` 
 *   changes, ensuring the parent component is updated with the current selection.
 *
 * Event Handlers:
 * ----------------
 * - handleValueChange: Updates the `selectedAlgo` state based on the toggle's checked status, 
 *                      switching between `optionOne` and `optionTwo`.
 *
 * Usage:
 * ------
 * The `AlgorithmSelector` component can be utilized in various parts of the application 
 * where an algorithm selection is required, such as during encryption or analysis settings.
 *
 * Example:
 * -------
 * <AlgorithmSelector 
 *   className="my-custom-class"
 *   componentHeader="Select Encryption Algorithm"
 *   optionOne="3D Chaotic Map"
 *   optionTwo="Cosine Transformation"
 *   onValueChange={(selected) => console.log(selected)}
 * />
 *
 * Dependencies:
 * -------------
 * - React: Core library for component rendering.
 * - useState and useEffect: React hooks for managing state and lifecycle events.
 *
 * Code Author:
 * ------------
 * - Charles Andre C. Bandala, Renz Carlo T. Caritativo
 * 
 * Date Created: 9/11/2024
 * Last Modified: 11/11/2024
 */

import React, { useState, useEffect } from "react";

export default function AlgorithmSelector({ 
    className, 
    componentHeader, 
    optionOne, 
    optionTwo, 
    onValueChange 
}) {

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
            <h1 className="text-sm text-primary2 font-semibold">{componentHeader}</h1>
            <label 
                className={`
                    relative 
                    flex 
                    items-center 
                    w-72 
                    h-8 
                    mt-1 
                    overflow-hidden 
                    rounded-lg 
                    border-2
                    border-transparent
                    ring-2
                    cursor-pointer 
                    ${selectedAlgo === optionOne ? 
                        'ring-primary2 bg-transparent' : 
                        'bg-transparent ring-primary2'}
                    `}>
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={selectedAlgo === optionTwo}
                    onChange={handleValueChange}
                />
                <span 
                    className={`
                        absolute 
                        w-1/2 
                        h-full 
                        rounded-lg 
                        bg-primary2
                        border-transparent
                        transition-all 
                        duration-300 
                        transform 
                        ${selectedAlgo === optionTwo ? "translate-x-full" : ""}
                        `}>
                </span>
                <div 
                    className="relative flex justify-between items-center w-full font-avantGarde">
                    <p 
                        className={`
                            w-1/2 
                            text-center 
                            font-bold 
                            text-sm 
                            ${selectedAlgo === optionOne ? 
                                'text-white' : 
                                'text-primary2'
                            } 
                            select-none 
                            transition-colors 
                            duration-300
                        `}>
                        {optionOne}
                    </p>
                    <p 
                        className={`
                            w-1/2
                            text-center 
                            font-bold 
                            text-sm 
                            ${selectedAlgo === optionTwo ? 'text-white' : 'text-primary2'} 
                            select-none 
                            transition-colors 
                            duration-300
                        `}>
                        {optionTwo}
                    </p>
                </div>
            </label>
        </div>
    );
}

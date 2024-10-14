import React from "react";

export default function NavButton({ className, buttonText, buttonColor, hoverColor, buttonTextColor, hoverTextColor, buttonIcon: Icon, onClickFunction, filePath }) {

    if (hoverColor === "") {
        hoverColor = buttonColor;
    }

    const handleClick = async () => {
        if (filePath) {
            try {
                await window.electron.openFileLocation(filePath);
            } 
            catch (error) {
                console.error("Error opening file location:", error);
            }
        }

        if (typeof onClickFunction === 'function') {
            onClickFunction();
        }
    };

    return (
        <div className={`${className}`}>
            <button
                className={`w-full h-full rounded-md bg-${buttonColor} font-medium text-${buttonTextColor} text-lg flex items-center justify-center transition-colors hover:bg-${hoverColor} hover:text-${hoverTextColor}`}
                onClick={handleClick}
                >
                {Icon && <Icon className="mr-2" size={22} />}
                {buttonText}
            </button>
        </div>
    );
}

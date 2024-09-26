import React from "react";

export default function NavButton({ className, buttonText, buttonColor, hoverColor, buttonTextColor, buttonIcon: Icon, onClickFunction }) {
    
    if (hoverColor === "") {
        hoverColor = buttonColor;
    }
    
    return (
        <div className={`${className}`}>
            <button
                className={`w-full h-full rounded-xl bg-${buttonColor} font-medium text-${buttonTextColor} text-lg flex items-center justify-center transition-colors hover:bg-${hoverColor}`}
                onClick={onClickFunction}
                >
                {Icon && <Icon className="mr-2" size={22} />}
                {buttonText}
            </button>
        </div>
    );
}
import React from "react";

export default function ProcessButton({ className, buttonText, onClickFunction }) {
    return (
        <div className={`${className}`}>
            <button
                className="w-56 h-14 bg-primary1 rounded-xl font-bold text-white text-lg transition-colors duration-300 hover:bg-primary0"
                onClick={onClickFunction}
                >
                {buttonText}
            </button>
        </div>
    );
}

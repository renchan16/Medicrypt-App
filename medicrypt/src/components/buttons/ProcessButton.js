import React from "react";

export default function ProcessButton({ className, buttonText, onClickFunction }) {
    return (
        <div className={`${className}`}>
            <button
                className="w-56 h-14 left-1/2 bg-primary1 rounded-xl font-bold text-white text-lg"
                onClick={onClickFunction}
                >
                {buttonText}
            </button>
        </div>
    );
}

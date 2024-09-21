import React from "react";

export default function EncryptButton({ className, buttonText, onClickFunction, width, height }) {
    return (
        <div className={`${className}`}>
            <button
                className="bg-primary1 rounded-xl font-bold text-white text-lg"
                style={{ width: width, height: height }}
                onClick={onClickFunction}
            >
                {buttonText}
            </button>
        </div>
    );
}

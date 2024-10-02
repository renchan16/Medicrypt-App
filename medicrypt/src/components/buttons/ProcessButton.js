import React from "react";

export default function ProcessButton({ className, buttonText, buttonIcon: Icon, iconLocation = "left", buttonSize = "", isEnabled = true, onClickFunction }) {
    return (
        <div className={`${className} ${isEnabled ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            <button
                className={`${buttonSize === "" ? "w-56 h-14" : buttonSize} flex items-center justify-center bg-primary1 rounded-2xl font-bold text-white text-lg transition-all duration-300 hover:bg-primary0 ${isEnabled ? "opacity-100" : "opacity-50"}`}
                onClick={onClickFunction}
                disabled={!isEnabled}
            >
                {iconLocation === "left" && Icon && <Icon className="mr-2" size={22} />}
                {buttonText}
                {iconLocation === "right" && Icon && <Icon className="ml-2" size={22} />}
            </button>
        </div>
    );
}
import React from "react";

export default function ProcessButton({
    className,
    buttonText,
    buttonIcon: Icon,
    iconLocation = "left",
    isEnabled = true,
    onClickFunction
}) {
    return (
        <div className={`${className} ${isEnabled ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            <button
                className={`w-full h-full flex items-center justify-center bg-white text-secondary border-2 border-secondary rounded-2xl font-bold text-lg transition-all duration-300 
                    hover:bg-secondary hover:text-white hover:border-transparent ${isEnabled ? "opacity-100" : "opacity-0"}`}
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

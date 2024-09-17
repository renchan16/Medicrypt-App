import React, { useState } from "react";

export default function EncryptButton( {className, onClickFunction} ){
    return (
        <div className={`${className}`}>
            <button className="w-full h-full bg-primary-lighter rounded-xl font-bold text-white text-lg" onClick={onClickFunction}>ENCRYPT</button>
        </div>
    );
}
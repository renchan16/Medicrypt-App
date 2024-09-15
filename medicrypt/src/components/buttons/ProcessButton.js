import React, { useState } from "react";

export default function EncryptButton( {className} ){
    return (
        <div className={`${className}`}>
            <button className="w-44 h-14 bg-primary-lighter rounded-xl font-bold text-white text-lg">ENCRYPT</button>
        </div>
    );
}
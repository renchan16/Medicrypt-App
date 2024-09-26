import { useState } from "react";

export const ProcessErrorMessage = (stdout) => {
    
    if (stdout === "WRONG PASSWORD"){
        return "It seems like you have used a wrong password for decryption. Please try again."
    }

    return "An unknown error has occured. Please try again."
};
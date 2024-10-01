import { useState } from "react";

export const ProcessErrorMessage = (response) => {

    if (response.data['stdout'] === "WRONG PASSWORD"){
        return "It seems like you have used a wrong password for decryption. Please try again."
    }

    if (response.data['stderr'] === "^C"){
        return "The process has been halted by user request."
    }

    return "An unknown error has occured. Please try again."
};
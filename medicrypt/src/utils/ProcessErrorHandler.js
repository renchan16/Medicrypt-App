export const ProcessErrorMessage = (response) => {

    if (response['stdout'] === "WRONG PASSWORD"){
        return "It seems like you have used a wrong password for decryption. Please try again."
    }
    else if (response['stdout'] === "HALTED"){
        return "The process has been halted by user request."
    }
    else if (response['stdout'] === "MISMATCH VIDEO RESOLUTION"){
        return "It seems that the original video that you uploaded has a different resolution."
    }
    else {
        console.log(response['stdout'])
        return "An unknown error has occured. Please try again."
    }
};
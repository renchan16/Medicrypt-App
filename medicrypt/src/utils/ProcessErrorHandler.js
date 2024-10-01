export const ProcessErrorMessage = (response) => {

    if (response.data['stdout'] === "WRONG PASSWORD"){
        return "It seems like you have used a wrong password for decryption. Please try again."
    }
    else if (response.data['stdout'] === "HALTED"){
        return "The process has been halted by user request."
    }
    else {
        console.log(response.data['stdout'])
        return "An unknown error has occured. Please try again."
    }
};
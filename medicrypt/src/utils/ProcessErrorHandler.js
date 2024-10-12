export const ProcessErrorMessage = (response) => {
    // Split stdout and stderr strings into arrays of lines
    const stdoutLines = response['stdout'].split('\n');
    const stderrLines = response['stderr'].split('\n');

    // Get the last non-empty line from both stdout and stderr
    const lastStdoutLine = stdoutLines.filter(line => line.trim() !== '').pop();
    const lastStderrLine = stderrLines.filter(line => line.trim() !== '').pop();

    // Check the last stdout line for known errors
    if (lastStdoutLine === "WRONG PASSWORD") {
        return "INVALID PASSWORD: It seems like you have used a wrong password for decryption. Please try again.";
    } 
    else if ((lastStderrLine && lastStderrLine.includes("HALTED")) || (lastStdoutLine.includes("HALTED"))) {
        return "PROCESS HALTED: The operation was successfully stopped as per your request.";
    } 
    else if (lastStderrLine && lastStderrLine.includes("MISMATCH RESOLUTION")) {
        return "MISMATCHED VIDEO: It seems that the original video that you uploaded has a different resolution.";
    }
    else if (lastStderrLine && lastStderrLine.includes("INVALID KEY")) {
        const errorMessageIndex = lastStderrLine.indexOf("INVALID KEY");
        const errorMessage = lastStderrLine.slice(errorMessageIndex); // Extract substring from "INVALID KEY"
        return errorMessage;
    }
    else {
        return "An unknown error has occurred. Please try again.";
    }
};
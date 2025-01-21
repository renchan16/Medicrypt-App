/**
 * ProcessErrorMessage Utility Function
 *
 * The `ProcessErrorMessage` function interprets and formats error messages received from the response
 * object, which contains standard output (`stdout`) and standard error (`stderr`) logs. It identifies
 * specific issues such as incorrect passwords, process halts, resolution mismatches, or invalid keys,
 * and returns a user-friendly message.
 *
 * Parameters:
 * -----------
 * @param {Object} response - Response object containing `stdout` and `stderr` strings from a process.
 *
 * Error Conditions:
 * -----------------
 * - **"WRONG PASSWORD"**: Identifies if the last non-empty line in `stdout` indicates a password mismatch for decryption.
 * - **"HALTED"**: Checks for a halt command in the last lines of `stdout` or `stderr`, returning a message if the process was halted.
 * - **"MISMATCH RESOLUTION"**: Looks for resolution mismatch messages in `stderr`, typically indicating an issue with video resolution.
 * - **"INVALID KEY"**: Detects invalid key errors in `stderr` and returns a precise message from the point of error.
 * - **Unknown Error**: If none of the above conditions are met, returns a general error message suggesting a retry.
 *
 * Returns:
 * --------
 * - {string} - A formatted message corresponding to a recognized error condition or an unknown error message.
 *
 * Example Return Value:
 * ---------------------
 * - If the last `stdout` line is "WRONG PASSWORD", it will return:
 *   ```
 *   "INVALID PASSWORD: It seems like you have used a wrong password for decryption. Please try again."
 *   ```
 * - If `stderr` contains "HALTED", it will return:
 *   ```
 *   "PROCESS HALTED: The operation was successfully stopped as per your request."
 *   ```
 *
 * Usage:
 * ------
 * This function is suitable for handling backend error responses and providing user-friendly feedback in UI components.
 *
 * Code Author:
 * ------------
 * - Charles Andre C. Bandala
 *
 * Date Created: 9/26/2024
 * Last Modified: 11/11/2024
 */

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
        const errorMessage = lastStderrLine.slice(errorMessageIndex) + "."; // Extract substring from "INVALID KEY"
        return errorMessage;
    }
    else {
        return "An unknown error has occurred. Please try again.";
    }
};
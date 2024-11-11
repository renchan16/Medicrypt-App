/**
 * ValidateFilePath Utility Function
 *
 * This `ValidateFilePath` utility function asynchronously validates a given file path or list of file paths based on
 * various conditions, such as whether the file path is required, if multiple files are allowed, and if dependencies are
 * met in the provided list. It returns an object with validation status and feedback message, which can be used for form
 * input validation in React components.
 *
 * Parameters:
 * -----------
 * @param {string | string[]} filePath - The file path(s) to validate. It can be a string for a single path or an array of strings for multiple paths.
 * @param {string} defaultDisplayText - The default message to display if the file path is optional and empty.
 * @param {boolean} allowMultiple - Allows multiple file paths if set to `true`.
 * @param {string} allowMultipleText1 - Descriptor for the selected file(s), used in error messages when multiple files are expected.
 * @param {string} allowMultipleText2 - Descriptor for dependent files in `dependencyList`, used in error messages when file counts don’t match.
 * @param {Array} dependencyList - Array of dependencies to check against the number of selected file paths, ensuring that each path has a corresponding dependency.
 * @param {boolean} isRequired - Indicates if the file path is required for validation to pass.
 *
 * Internal Functions:
 * -------------------
 * - validateMultipleFiles: Validates that the number of provided file paths matches the length of `dependencyList` if present. 
 *                          Returns an object with a `valid` boolean and `message` string based on whether the count matches.
 *
 * Validation Logic:
 * -----------------
 * - Checks if the file path is required and empty, displaying "This field is required!" if empty.
 * - Uses `window.electron.checkFilePath` to verify the validity of the file path.
 * - If multiple files are allowed and a dependency list is present, it ensures that the count of files matches the dependency list count.
 * - Provides specific messages based on various conditions:
 *   - When the file path is valid or invalid.
 *   - When multiple files are allowed and the counts do or do not match the dependencies.
 *
 * Returns:
 * --------
 * - {Object} Contains:
 *   - `inputValidity` (boolean): Indicates if the file path(s) is valid.
 *   - `inputMessage` (string): Message string providing feedback on the validation status.
 *
 * Usage:
 * ------
 * This function is intended for validating file paths in React forms where file selection and dependency checks are required. 
 * It is designed to work with Electron’s `window.electron.checkFilePath` method for file path verification.
 *
 * Dependencies:
 * -------------
 * - Electron: For accessing the `window.electron.checkFilePath` IPC method, which validates file paths by checking their existence.
 *
 * Code Author:
 * ------------
 * - Renz Carlo T. Caritativo, Charles Andre C. Bandala
 *
 * Date Created: 9/23/2024
 * Last Modified: 11/11/2024
 */

export const ValidateFilePath = async (
    filePath, 
    defaultDisplayText, 
    allowMultiple = false, 
    allowMultipleText1="", 
    allowMultipleText2="", 
    dependencyList = [], 
    isRequired
) => {

    const isValidPath = await window.electron.checkFilePath(filePath);
    let inputValidity;
    let inputMessage;

    const isEmptyPath = filePath === null || filePath === "" || (Array.isArray(filePath) && filePath.length === 0);
    const fileCount = Array.isArray(filePath) ? filePath.length : (filePath ? 1 : 0);

    // Validates the file path depending on the count of the file path inputted
    const validateMultipleFiles = () => {
        if (dependencyList.length === 0 || fileCount === dependencyList.length) {
            return { 
                valid: true, 
                message: isRequired ? "Great choice! The file paths look good." : defaultDisplayText 
            };
        } 
        else {
            return { 
                valid: false, 
                message: `The number of ${allowMultipleText1} (${fileCount}) doesn't match the number of ${allowMultipleText2} (${dependencyList.length})!` 
            };
        }
    };

    switch (true) {
        case isRequired && isEmptyPath:
            inputValidity = false;
            inputMessage = "This field is required!";
            break;

        case isRequired && isValidPath:
            if (allowMultiple === true && dependencyList.length > 0) {  // Check if dependencyList has elements
                ({ valid: inputValidity, message: inputMessage } = validateMultipleFiles());
            }
            else {
                inputValidity = true;
                inputMessage = "Great choice! The file path looks good.";
            }
            break;

        case isRequired && !isValidPath:
            inputValidity = false;
            inputMessage = "Invalid file path!";
            break;

        case !isRequired && isEmptyPath:
            inputValidity = true;
            inputMessage = defaultDisplayText;
            break;

        case !isRequired && isValidPath:
            if (allowMultiple && dependencyList.length > 0) {
                ({ valid: inputValidity, message: inputMessage } = validateMultipleFiles());
            } else {
                inputValidity = true;
                inputMessage = defaultDisplayText;
            }
            break;

        case !isRequired && !isValidPath:
            inputValidity = false;
            inputMessage = "Invalid file path!";
            break;

        default:
            inputValidity = false;
            inputMessage = "Unexpected case in file path validation";
    }

    return { inputValidity, inputMessage };
};
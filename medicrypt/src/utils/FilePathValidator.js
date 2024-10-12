export const ValidateFilePath = async (filePath, defaultDisplayText, allowMultiple = false, allowMultipleText1="", allowMultipleText2="", dependencyList = [], isRequired) => {
    const isValidPath = await window.electron.checkFilePath(filePath);
    let inputValidity;
    let inputMessage;

    const isEmptyPath = filePath === null || filePath === "" || (Array.isArray(filePath) && filePath.length === 0);
    const fileCount = Array.isArray(filePath) ? filePath.length : (filePath ? 1 : 0);

    const validateMultipleFiles = () => {
        if (dependencyList.length === 0 || fileCount === dependencyList.length) {
            return { valid: true, message: isRequired ? "Great choice! The file paths look good." : defaultDisplayText };
        } 
        else {
            return { valid: false, message: `The number of ${allowMultipleText1} (${fileCount}) doesn't match the number of ${allowMultipleText2} (${dependencyList.length})!` };
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
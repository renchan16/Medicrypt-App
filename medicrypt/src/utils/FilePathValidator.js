export const ValidateFilePath = async (filePath, defaultDisplayText, isRequired) => {
    const isValidPath = await window.electron.checkFilePath(filePath);
    let inputValidity;
    let inputMessage;

    if (isRequired) {
        // Check both value and validity when isRequired is true
        if (filePath === null || filePath === "" || (Array.isArray(filePath) && filePath.length === 0)) {
            inputValidity = false;
            inputMessage = "This field is required!"
        } 
        else if (isValidPath) {
            inputValidity = true;
            inputMessage = "Great choice! The file path looks good."
        } 
        else {
            inputValidity = false;
            inputMessage = "Invalid file path!"
        }
    }
    else {
        if (filePath === null || filePath === "" || (Array.isArray(filePath) && filePath.length === 0)) {
            inputValidity = true;
            inputMessage = defaultDisplayText
        } 
        else if (isValidPath) {
            inputValidity = true;
            inputMessage = defaultDisplayText
        } 
        else {
            inputValidity = false;
            inputMessage = "Invalid file path!"
        }
    }

    return { inputValidity, inputMessage };
}
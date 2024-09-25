export const ValidateFilePath = async (filePath, isRequired) => {
    const isValidPath = await window.electron.checkFilePath(filePath);
    let inputValidity;
    let inputWarning;

    if (isRequired) {
        // Check both value and validity when isRequired is true
        if (filePath === null || filePath === "") {
            inputValidity = false;
            inputWarning = "This field is required!"
        } 
        else if (isValidPath) {
            inputValidity = true;
            inputWarning = null
        } 
        else {
            inputValidity = false;
            inputWarning = "Invalid file path!"
        }
    }
    else {
        if (filePath === null || filePath === "") {
            inputValidity = true;
            inputWarning = null
        } 
        else if (isValidPath) {
            inputValidity = true;
            inputWarning = null
        } 
        else {
            inputValidity = false;
            inputWarning = "Invalid file path!"
        }
    }

    return { inputValidity, inputWarning };
}
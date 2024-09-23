export const ValidateFilePath = async (filepath) => {
    const isValidPath = await window.electron.checkFilePath(filepath);
    return isValidPath;
}
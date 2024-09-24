export const ValidatePassword = (password) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialCharacter = /[^A-Za-z0-9]/.test(password); // matches any non-alphanumeric character
    const hasSpace = /\s/.test(password);
    const isValidLength = password.length >= 8; // Check for minimum length of 8 characters

    const passwordValidity = hasUppercase && hasLowercase && hasDigit && hasSpecialCharacter && !hasSpace && isValidLength;
    let passwordRequirements = "Password must have "; // Start of requirements message

    const requirements = [];
    if (!isValidLength) {
        requirements.push("at least 8 characters");
    }
    if (!hasUppercase) {
        requirements.push("an Uppercase Letter");
    }
    if (!hasLowercase) {
        requirements.push("a Lowercase Letter");
    }
    if (!hasDigit) {
        requirements.push("a Digit");
    }
    if (!hasSpecialCharacter) {
        requirements.push("a Special Character (e.g. !@#$%^&*)");
    }
    if (hasSpace) {
        requirements.push("no Spaces");
    }

    // Join requirements with commas and add a period at the end
    passwordRequirements += requirements.join(", ") + (requirements.length > 0 ? "." : "");

    return {
        passwordValidity,
        passwordRequirements: passwordValidity ? null : passwordRequirements // Return requirements only if invalid
    };
};
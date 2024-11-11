/**
 * ValidatePassword Utility Function
 *
 * This `ValidatePassword` utility function checks if a given password meets certain security requirements,
 * including character composition and minimum length. It returns an object with the password's validity status
 * and a descriptive message listing any unmet requirements.
 *
 * Parameters:
 * -----------
 * @param {string} password - The password string to be validated.
 *
 * Validation Criteria:
 * --------------------
 * - `hasUppercase`: Password contains at least one uppercase letter (A-Z).
 * - `hasLowercase`: Password contains at least one lowercase letter (a-z).
 * - `hasDigit`: Password contains at least one numeric digit (0-9).
 * - `hasSpecialCharacter`: Password contains at least one special character (e.g., !@#$%^&*).
 * - `hasSpace`: Password should not contain any whitespace characters.
 * - `isValidLength`: Password length should be at least 8 characters.
 *
 * Validation Logic:
 * -----------------
 * - `passwordValidity`: Combines all criteria above to determine overall password validity.
 * - `passwordRequirements`: Generates a message listing unmet criteria if `passwordValidity` is `false`. If the password 
 *   is valid, `passwordRequirements` is `null`.
 *
 * Returns:
 * --------
 * - {Object} Contains:
 *   - `passwordValidity` (boolean): Indicates if the password meets all criteria.
 *   - `passwordRequirements` (string|null): A message listing missing requirements if the password is invalid, 
 *      or `null` if the password is valid.
 *
 * Usage:
 * ------
 * This function is useful for password validation in forms, providing users with feedback on missing requirements.
 *
 * Example Return Value:
 * ---------------------
 * For an invalid password (e.g., "pass"), it might return:
 * ```
 * {
 *   passwordValidity: false,
 *   passwordRequirements: "Password must have at least 8 characters, an Uppercase Letter, a Digit, a Special Character (e.g. !@#$%^&*), no Spaces."
 * }
 * ```
 *
 * Code Author:
 * ------------
 * - Renz Carlo T. Caritativo, Charles Andre C. Bandala
 *
 * Date Created: 9/22/2024
 * Last Modified: 11/11/2024
 */

export const ValidatePassword = (password) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialCharacter = /[^A-Za-z0-9]/.test(password); // matches any non-alphanumeric character
    const hasSpace = /\s/.test(password);
    const isValidLength = password.length >= 8; // Check for minimum length of 8 characters

    const passwordValidity = hasUppercase && hasLowercase && hasDigit && hasSpecialCharacter && !hasSpace && isValidLength;
    let passwordRequirements = "Password must have "; // Start of requirements message

    // Requirements
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
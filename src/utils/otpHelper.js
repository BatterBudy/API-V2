
// utils.js

/**
 * Generates a random alphanumeric OTP (One-Time Password) code.
 * @param {number} length The length of the OTP code to generate.
 * @returns {string} The generated OTP code.
 */
export const generateOTP = (length = 6) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let otp = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        otp += characters[randomIndex];
    }

    return otp;
}


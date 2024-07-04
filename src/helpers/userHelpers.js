
import UserRepository from '../repositories/UserRepository.js';
import { generateBlobSasUrl } from '../utils/fileUploadService.js';

export const validateUser = async (user_id) => {
    const user = await UserRepository.findById(user_id);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}

export const cleanUserData = async (user) => {
    var { password, ...cleanUser } = user;

    if (cleanUser.image) {
        cleanUser = await generateProfileImageUrl(cleanUser); // Await the promise
    }

    return cleanUser;
}

export const generateProfileImageUrl = async (user) => {
    console.log("Getting the profile image url");

    try {
        const url = await generateBlobSasUrl('images', user.image); // Await the promise
        if (url !== null) {
            user.image = url;
        }
        return user;
    } catch (error) {
        console.log(error);
        return user;
    }
}


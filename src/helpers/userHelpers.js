
import UserRepository from '../repositories/UserRepository.js';

export const validateUser = async (user_id) => {
    const user = await UserRepository.findById(user_id);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}

export const cleanUserData = (user) => {
    const { password, ...cleanUser } = user;
    return cleanUser;
}
// container.js
import { createContainer, asClass, asFunction } from 'awilix';
import UserRepository from './repositories/UserRepository';
import InviteRepository from './repositories/InviteRepository';
import CommunityInviteRepository from './repositories/CommunityInviteRepository';
import OtpGenerator from './services/OtpGenerator';
import CommunityInviteService from './services/CommunityInviteService';

const container = createContainer();

container.register({
    userRepository: asClass(UserRepository).singleton(),
    inviteRepository: asClass(InviteRepository).singleton(),
    communityInviteRepository: asClass(CommunityInviteRepository).singleton(),
    otpGenerator: asClass(OtpGenerator).singleton(),
    communityInviteService: asClass(CommunityInviteService).singleton()
});

export default container;
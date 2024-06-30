import InterestRepository from '../repositories/InterestRepository.js';

class InterestService {

    async create(interest) {
        //check if interest already existed
        var { name } = interest;
        name = name.toLowerCase();

        const existingInterest = await InterestRepository.findByName(name);
        if (existingInterest) {
            throw new Error('Interest already exists');
        }

        return await InterestRepository.create(interest);
    }

    async findAll() {
        return await InterestRepository.findAll();
    }

    async findByName(name) {
        return await InterestRepository.findByName(name);
    }

    async findById(id) {
        return await InterestRepository.findById(id);
    }
}

export default new InterestService();
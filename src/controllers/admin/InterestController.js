import { validationResult } from 'express-validator';
import InterestService from '../../services/InterestService.js';

class InterestController {

    async create(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const interest = await InterestService.create(req.body);
            res.status(201).json({ interest });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async get(req, res) {

        try {
            const { id, name } = req.query;

            if (id) {
                this.getById(res, id);
                return;
            }

            if (name) {
                this.getByName(res, name);
                return;
            }

            const interests = await InterestService.findAll();
            res.status(200).json({ interests });

        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getById(res, id) {
        const interest = await InterestService.findById(id);
        console.log(interest);

        if (!interest) {
            return res.status(404).json({ error: 'Interest not found' });
        }
        res.status(200).json({ interest })
    }

    async getByName(res, name) {
        const interests = await InterestService.findByName(name);
        if (!interests) {
            return res.status(404).json({ error: 'Interest not found' });
        }

        res.status(200).json({ interests });
    }
}

export default new InterestController()
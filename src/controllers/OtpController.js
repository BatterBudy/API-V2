import UserService from '../services/UserService.js';

class OtpController {
    async validateOtp(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            await UserService.validateOpt(req.body);
            res.status(202).json({ message: "Opt successfully validated" });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new OtpController();
import bcrypt from 'bcryptjs';

class User {
    constructor({ id, first_name, last_name, email, phone_number, password, role }) {
        this.id = id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.phone_number = phone_number;
        this.password = password;
        this.role = role || 'user';
    }

    async setPassword(password) {
        this.password = await bcrypt.hash(password, 8);
    }

    async comparePassword(candidatePassword) {
        return bcrypt.compare(candidatePassword, this.password);
    }
}

export default User;
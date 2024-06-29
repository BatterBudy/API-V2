import pool from '../database.js';

class InterestRepository {

    async findAll() {
        const [rows] = await pool.query('SELECT * FROM interest');
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM interest WHERE id = ?', [id]);
        return rows[0];
    }

    async create(interest) {
        var { name, description } = interest;
        name = name.toLowerCase();
        const [result] = await pool.query(
            'INSERT INTO interest (name, description) VALUES (?, ?)',
            [name, description]
        );
        return this.findById(result.insertId);
    }

    async findByName(name) {
        const [rows] = await pool.query('SELECT * FROM interest WHERE name = ?', [name]);
        return rows[0];
    }

    
}

export default new InterestRepository();
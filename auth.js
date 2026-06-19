const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');

const router = express.Router();

router.get('/test', (req, res) => {
    res.json({ message: 'Auth route working' });
});

router.post('/register', async (req, res) => {
    try {
        const {
            email,
            password,
            first_name,
            last_name
        } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            `INSERT INTO users
            (email,password,first_name,last_name)
            VALUES (?,?,?,?)`,
            [
                email,
                hashedPassword,
                first_name,
                last_name
            ]
        );

        res.json({
            success: true,
            userId: result.insertId
        });

    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;
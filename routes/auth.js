require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('../db');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/routes/auth', authRoutes);

app.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT NOW() AS currentTime');
        res.json(rows);
    } catch (error) {
        res.status(500).json(error);
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

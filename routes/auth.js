const express = require('express');
const router = express.Router();

const db = require('../models/db');  // Use the connection pool with promises
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Вход пользователя
router.post('/', async (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ?';

    try {
        const [results] = await db.query(query, [email]);
        if (results.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).send('Invalid password');
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Server error');
    }

});

module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

// Авторизация преподавателя
router.post('/', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM teachers WHERE email = ?';

    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }
        if (results.length === 0) return res.status(401).send('User not found');

        const teacher = results[0];
        const isMatch = bcrypt.compareSync(password, teacher.password_hash);

        if (!isMatch) return res.status(401).send('Invalid credentials');

        const token = jwt.sign({ id: teacher.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
});

module.exports = router;

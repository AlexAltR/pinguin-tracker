const express = require('express');
const router = express.Router();
const db = require('../models/db');
const jwt = require('jsonwebtoken');

// Middleware для проверки JWT
router.use((req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).send('Access denied. No token provided.');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Invalid token:', err);
        res.status(400).send('Invalid token.');
    }
});

// Добавление пингвина студенту
router.post('/add', (req, res) => {
    const { student_id } = req.body;
    const query = 'INSERT INTO penguins (student_id, count) VALUES (?, 1) ON DUPLICATE KEY UPDATE count = count + 1';

    db.query(query, [student_id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }
        res.status(200).send('Penguin added');
    });
});

module.exports = router;

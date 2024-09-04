const express = require('express');
const router = express.Router();
const db = require('../models/db');
const jwt = require('jsonwebtoken');

// Middleware для проверки JWT (только для защищенных маршрутов)
router.use((req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token && req.path !== '/public') {
        return res.status(401).send('Access denied. No token provided.');
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (err) {
            return res.status(400).send('Invalid token.');
        }
    }

    next();
});

// Получение списка групп
router.get('/', (req, res) => {
    const teacherId = req.user.id;
    const query = 'SELECT id, `name` FROM `groups` WHERE teacher_id = ?';

    db.query(query, [teacherId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }
        res.json(results);
    });
});

// Получение списка групп для публичного доступа
router.get('/public', (req, res) => {
    const query = 'SELECT id, `name` FROM `groups`';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }
        res.json(results);
    });
});


module.exports = router;

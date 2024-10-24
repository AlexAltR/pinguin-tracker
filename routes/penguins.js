// penguins.js
const express = require('express');
const router = express.Router(); // Создаем новый роутер для маршрутов
const db = require('../models/db'); // Подключаем пул соединений с базой данных
const jwt = require('jsonwebtoken'); // Подключаем jsonwebtoken для работы с JWT

// Middleware для проверки JWT (аутентификация пользователя)
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

// Маршрут для добавления пингвина студенту
router.post('/add', async (req, res) => {
    const { student_id } = req.body;

    const query = 'INSERT INTO penguins (student_id, count) VALUES (?, 1) ON DUPLICATE KEY UPDATE count = count + 1';

    try {
        // Выполняем SQL-запрос с использованием пула соединений
        await db.query(query, [student_id]);
        res.status(200).send('Penguin added');
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;

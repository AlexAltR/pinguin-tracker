// groups.js
const express = require('express');
const router = express.Router(); // Создаем новый роутер для маршрутов Express
const db = require('../models/db'); // Подключаем пул соединений базы данных
const jwt = require('jsonwebtoken'); // Подключаем модуль для работы с JWT

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

// Получение списка групп (защищённый маршрут, доступен только для аутентифицированных пользователей)
router.get('/', async (req, res) => {
    const teacherId = req.user.id;

    try {
        const [results] = await db.query('SELECT id, `name` FROM `groups` WHERE teacher_id = ?', [teacherId]);
        res.json(results);
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).send('Server error');
    }
});

// Получение списка групп для публичного доступа (не требует авторизации)
router.get('/public', async (req, res) => {
    try {
        const [results] = await db.query('SELECT id, `name` FROM `groups`');
        res.json(results);
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).send('Server error');
    }
});

module.exports = router;

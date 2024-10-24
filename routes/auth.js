// auth.js
const express = require('express');
const router = express.Router(); // Создаем новый роутер для маршрутов Express
const bcrypt = require('bcryptjs'); // Подключаем bcryptjs для хеширования и проверки паролей
const jwt = require('jsonwebtoken'); // Подключаем jsonwebtoken для генерации JWT-токенов
const db = require('../models/db'); // Подключаем пул соединений базы данных

// Маршрут для авторизации преподавателя
router.post('/', async (req, res) => {
    const { email, password } = req.body;  // Деструктурируем email и пароль из тела запроса

    try {
        // SQL-запрос для получения данных преподавателя по email
        const [results] = await db.query('SELECT * FROM teachers WHERE email = ?', [email]);

        // Если преподаватель с таким email не найден, возвращаем 401 (Unauthorized)
        if (results.length === 0) return res.status(401).send('User not found');

        const teacher = results[0];  // Получаем информацию о преподавателе

        // Сравниваем переданный пароль с хешем пароля из базы данных
        const isMatch = bcrypt.compareSync(password, teacher.password_hash);

        // Если пароль не совпадает, возвращаем 401 (Unauthorized)
        if (!isMatch) return res.status(401).send('Invalid credentials');

        // Если пароль верен, создаём JWT-токен, который содержит id преподавателя
        const token = jwt.sign({ id: teacher.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Отправляем токен в ответе
        res.json({ token });
    } catch (err) {
        // Если произошла ошибка при запросе к базе данных, выводим ошибку в консоль и возвращаем статус 500
        console.error('Database error:', err);
        return res.status(500).send('Server error');
    }
});

module.exports = router;

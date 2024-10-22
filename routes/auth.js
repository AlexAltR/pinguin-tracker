const express = require('express');
const router = express.Router(); // Создаем новый роутер для маршрутов Express
const bcrypt = require('bcryptjs'); // Подключаем bcryptjs для хеширования и проверки паролей
const jwt = require('jsonwebtoken'); // Подключаем jsonwebtoken для генерации JWT-токенов
const db = require('../models/db'); // Подключаем базу данных (модуль для взаимодействия с MySQL)

// Маршрут для авторизации преподавателя
router.post('/', (req, res) => {
    // Деструктурируем email и password из тела запроса
    const { email, password } = req.body;

    // SQL-запрос на получение данных преподавателя по email
    const query = 'SELECT * FROM teachers WHERE email = ?';

    // Выполняем запрос к базе данных
    db.query(query, [email], (err, results) => {
        if (err) {
            // Если произошла ошибка при запросе к базе данных, выводим ошибку в консоль и возвращаем статус 500
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }

        // Если преподаватель с таким email не найден, возвращаем статус 401 (Unauthorized)
        if (results.length === 0) return res.status(401).send('User not found');

        const teacher = results[0]; // Получаем информацию о преподавателе из результата запроса

        // Сравниваем переданный пароль с хешем пароля из базы данных
        const isMatch = bcrypt.compareSync(password, teacher.password_hash);

        // Если пароль не совпадает, возвращаем статус 401 (Unauthorized) с сообщением об ошибке
        if (!isMatch) return res.status(401).send('Invalid credentials');

        // Если пароль верен, создаём JWT-токен, который содержит id преподавателя
        const token = jwt.sign({ id: teacher.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // JWT-токен создаётся с секретным ключом из переменной окружения JWT_SECRET и истекает через 1 час

        // Отправляем токен в ответе
        res.json({ token });
    });
});

module.exports = router; // Экспортируем роутер для использования в основном файле Express

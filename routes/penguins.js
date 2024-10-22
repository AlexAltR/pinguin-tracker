const express = require('express');
const router = express.Router(); // Создаем новый экземпляр роутера Express для маршрутов
const db = require('../models/db'); // Подключаем модуль для работы с базой данных
const jwt = require('jsonwebtoken'); // Подключаем jsonwebtoken для работы с JWT токенами

// Middleware для проверки JWT (аутентификация пользователя)
router.use((req, res, next) => {
    // Извлекаем заголовок авторизации из запроса
    const authHeader = req.headers['authorization'];
    // Если заголовок существует, получаем сам токен (берем часть строки после 'Bearer ')
    const token = authHeader && authHeader.split(' ')[1];

    // Если токен не передан, возвращаем статус 401 (Unauthorized) и сообщение об отсутствии токена
    if (!token) return res.status(401).send('Access denied. No token provided.');

    try {
        // Пытаемся верифицировать токен с использованием секретного ключа из переменной окружения
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Если верификация успешна, сохраняем данные из токена (например, id пользователя) в объекте `req`
        req.user = decoded;
        next(); // Переходим к следующему middleware или маршруту
    } catch (err) {
        // Если токен недействителен, выводим сообщение об ошибке и возвращаем статус 400 (Bad Request)
        console.error('Invalid token:', err);
        res.status(400).send('Invalid token.');
    }
});

// Маршрут для добавления пингвина студенту
router.post('/add', (req, res) => {
    // Извлекаем ID студента из тела запроса
    const { student_id } = req.body;

    // SQL-запрос для добавления нового пингвина студенту
    // Если запись для студента уже существует, увеличиваем количество пингвинов на 1 (ON DUPLICATE KEY UPDATE)
    const query = 'INSERT INTO penguins (student_id, count) VALUES (?, 1) ON DUPLICATE KEY UPDATE count = count + 1';

    // Выполняем SQL-запрос к базе данных
    db.query(query, [student_id], (err, result) => {
        // Если возникает ошибка при запросе к базе данных, выводим ошибку и возвращаем статус 500 (Internal Server Error)
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }
        // Если запрос выполнен успешно, отправляем статус 200 (OK) и сообщение о том, что пингвин добавлен
        res.status(200).send('Penguin added');
    });
});

module.exports = router; // Экспортируем роутер для использования в других частях приложения

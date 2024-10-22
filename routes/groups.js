const express = require('express');
const router = express.Router(); // Создаем новый экземпляр роутера Express для маршрутов
const db = require('../models/db'); // Подключаем базу данных для выполнения SQL-запросов
const jwt = require('jsonwebtoken'); // Подключаем модуль jsonwebtoken для работы с JWT

// Middleware для проверки JWT (только для защищенных маршрутов)
router.use((req, res, next) => {
    // Извлекаем заголовок авторизации (Authorization header) из запроса
    const authHeader = req.headers['authorization'];
    // Извлекаем сам токен из заголовка (если заголовок есть)
    const token = authHeader && authHeader.split(' ')[1];

    // Если токен отсутствует и маршрут не является публичным ('/public'), возвращаем статус 401 (Unauthorized)
    if (!token && req.path !== '/public') {
        return res.status(401).send('Access denied. No token provided.');
    }

    // Если токен существует, проверяем его подлинность
    if (token) {
        try {
            // Декодируем токен с использованием секретного ключа из переменных окружения
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Сохраняем информацию о пользователе (из токена) в объекте `req` для дальнейшего использования в маршрутах
            req.user = decoded;
        } catch (err) {
            // Если токен недействителен или истек, возвращаем статус 400 (Bad Request) с сообщением об ошибке
            return res.status(400).send('Invalid token.');
        }
    }

    // Переход к следующему middleware или маршруту
    next();
});

// Получение списка групп (защищённый маршрут, доступен только для аутентифицированных пользователей)
router.get('/', (req, res) => {
    // Извлекаем ID преподавателя из декодированного JWT токена
    const teacherId = req.user.id;
    // SQL-запрос для получения групп, связанных с этим преподавателем
    const query = 'SELECT id, `name` FROM `groups` WHERE teacher_id = ?';

    // Выполняем SQL-запрос
    db.query(query, [teacherId], (err, results) => {
        if (err) {
            // Если произошла ошибка во время выполнения запроса к базе данных, возвращаем статус 500 (Internal Server Error)
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }
        // Если запрос успешен, отправляем результаты (список групп) в виде JSON
        res.json(results);
    });
});

// Получение списка групп для публичного доступа (не требует авторизации)
router.get('/public', (req, res) => {
    // SQL-запрос для получения всех групп, доступных публично
    const query = 'SELECT id, `name` FROM `groups`';

    // Выполняем SQL-запрос
    db.query(query, (err, results) => {
        if (err) {
            // Если произошла ошибка во время выполнения запроса к базе данных, возвращаем статус 500 (Internal Server Error)
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }
        // Если запрос успешен, отправляем результаты (список групп) в виде JSON
        res.json(results);
    });
});

module.exports = router; // Экспортируем роутер для использования в других частях приложения

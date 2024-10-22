const express = require('express');
// Подключение express - фреймворк для создания веб-приложений на Node.js

// const mysql = require('mysql2');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// Эти модули закомментированы. Вероятно, в будущем планируется использовать MySQL для базы данных, bcrypt для хеширования паролей и JWT для аутентификации

const path = require('path');
// Подключение встроенного модуля path для работы с файловыми путями

require('dotenv').config();
// Подключение dotenv для загрузки переменных окружения из файла .env

const app = express();
// Создаем экземпляр Express приложения

app.use(express.json());
// Добавляем middleware для автоматического парсинга JSON в теле запросов

app.use(express.static(path.join(__dirname, 'public')));
// Добавляем middleware для обслуживания статических файлов (например, HTML, CSS, JS) из директории 'public'

// Настройка подключения к базе данных MySQL (закомментировано, но готово для будущего использования)
// const db = mysql.createConnection({
//     host: process.env.DB_HOST || 'localhost',  // Подключаемся к хосту MySQL, который может быть указан через .env
//     user: process.env.DB_USER || 'root',       // Имя пользователя для базы данных
//     password: process.env.DB_PASSWORD || 'root', // Пароль для базы данных
//     database: process.env.DB_NAME || 'penguin_tracker' // Имя базы данных
// });

// Подключение к базе данных MySQL (закомментировано)
// db.connect((err) => {
//     if (err) {
//         console.error('Error connecting to MySQL Database:', err);
//         return;
//     }
//     console.log('Connected to MySQL Database');
// });

// Настройка маршрутов для разных ресурсов (auth, groups, students, penguins)
// Маршрут для аутентификации
app.use('/auth', require('./routes/auth'));
// Маршрут для работы с группами
app.use('/groups', require('./routes/groups'));
// Маршрут для работы со студентами
app.use('/students', require('./routes/students'));
// Маршрут для работы с "пингвинами" (вероятно, ресурс в базе данных)
app.use('/penguins', require('./routes/penguins'));

// Установка порта для прослушивания сервера, по умолчанию это 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    // Когда сервер запущен, выводим сообщение в консоль с информацией о порте
    console.log(`Server is running on port ${PORT}`);
});

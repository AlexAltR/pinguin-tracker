// db.js
const mysql = require('mysql2');

// Создание пула соединений
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',  // Хост базы данных
    user: process.env.DB_USER || 'root',       // Имя пользователя базы данных
    password: process.env.DB_PASSWORD || 'root', // Пароль базы данных
    database: process.env.DB_NAME || 'penguin_tracker', // Имя базы данных
    waitForConnections: true,  // Ожидание доступных соединений в случае достижения предела
    connectionLimit: 10,  // Максимальное количество соединений в пуле
    queueLimit: 0  // Максимальное количество запросов в очереди (0 означает неограниченное количество)
});

// Экспорт пула соединений с использованием промисов
module.exports = pool.promise();

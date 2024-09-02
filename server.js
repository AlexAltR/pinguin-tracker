const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// const db = mysql.createConnection({
//     host: process.env.DB_HOST || 'localhost',
//     user: process.env.DB_USER || 'root',
//     password: process.env.DB_PASSWORD || 'root',
//     database: process.env.DB_NAME || 'penguin_tracker'
// });

// db.connect((err) => {
//     if (err) {
//         console.error('Error connecting to MySQL Database:', err);
//         return;
//     }
//     console.log('Connected to MySQL Database');
// });

// Маршруты
app.use('/auth', require('./routes/auth'));
app.use('/groups', require('./routes/groups'));
app.use('/students', require('./routes/students'));
app.use('/penguins', require('./routes/penguins'));
app.use('/groups', require('./routes/groups'));
app.use('/students', require('./routes/students'));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

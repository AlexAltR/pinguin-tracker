const express = require('express');
const router = express.Router();
const db = require('../models/db');  // Now this is the connection pool with promises
const jwt = require('jsonwebtoken');

// Получение списка студентов в группе для публичного доступа
router.get('/public/:groupId', async (req, res) => {
    const groupId = req.params.groupId;
    const query = `
        SELECT students.first_name, students.middle_name, students.last_name,
               COALESCE(SUM(penguins.count), 0) AS penguin_count
        FROM students
        LEFT JOIN penguins ON students.id = penguins.student_id
        WHERE students.group_id = ?
        GROUP BY students.id
        ORDER BY penguin_count DESC;
    `;

    try {
        const [results] = await db.query(query, [groupId]);
        res.json(results);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Server error');
    }
});

// Middleware для проверки JWT (применяется только к защищенным маршрутам)
router.use((req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(400).send('Invalid token.');
    }
});

// Получение списка студентов в группе
router.get('/:groupId', async (req, res) => {
    const groupId = req.params.groupId;
    const query = `
        SELECT students.id, students.first_name, students.middle_name, students.last_name,
               COALESCE(SUM(penguins.count), 0) AS penguin_count
        FROM students
        LEFT JOIN penguins ON students.id = penguins.student_id
        WHERE students.group_id = ?
        GROUP BY students.id
        ORDER BY penguin_count DESC;
    `;

    try {
        const [results] = await db.query(query, [groupId]);
        res.json(results);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Server error');
    }
});

// Добавление студента
router.post('/', async (req, res) => {
    const { first_name, middle_name, last_name, group_id } = req.body;
    const query = 'INSERT INTO students (first_name, middle_name, last_name, group_id) VALUES (?, ?, ?, ?)';

    try {
        await db.query(query, [first_name, middle_name, last_name, group_id]);
        res.status(201).send('Student added');
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Server error');
    }
});

// Удаление студента и связанных записей в таблице penguins
router.delete('/:id', async (req, res) => {
    const studentId = req.params.id;

    try {
        await db.beginTransaction();

        // Сначала удаляем записи из таблицы penguins
        await db.query('DELETE FROM penguins WHERE student_id = ?', [studentId]);

        // Затем удаляем студента
        await db.query('DELETE FROM students WHERE id = ?', [studentId]);

        // Завершение транзакции
        await db.commit();

        res.status(200).send('Student and related penguins deleted');
    } catch (err) {
        await db.rollback();
        console.error('Transaction error:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;

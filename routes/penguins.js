const express = require('express');
const router = express.Router();

const db = require('../models/db');  // Use the connection pool with promises

// Получение списка пингвинов для студента
router.get('/:studentId', async (req, res) => {
    const studentId = req.params.studentId;
    const query = 'SELECT * FROM penguins WHERE student_id = ?';

    try {
        const [results] = await db.query(query, [studentId]);
        res.json(results);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Server error');
    }
});

// Добавление пингвина
router.post('/', async (req, res) => {
    const { student_id, count } = req.body;
    const query = 'INSERT INTO penguins (student_id, count) VALUES (?, ?)';

    try {
        await db.query(query, [student_id, count]);
        res.status(201).send('Penguin added');
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Server error');
    }
});

// Удаление пингвина
router.delete('/:id', async (req, res) => {
    const penguinId = req.params.id;

    try {
        await db.query('DELETE FROM penguins WHERE id = ?', [penguinId]);
        res.status(200).send('Penguin deleted');
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Server error');
    }

});

module.exports = router;

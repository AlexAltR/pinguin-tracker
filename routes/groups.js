const express = require('express');
const router = express.Router();

const db = require('../models/db');  // Use the connection pool with promises

// Получение списка групп
router.get('/public', async (req, res) => {
    const query = 'SELECT * FROM groups';

    try {
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Server error');
    }
});

// Получение группы по ID
router.get('/:id', async (req, res) => {
    const groupId = req.params.id;
    const query = 'SELECT * FROM groups WHERE id = ?';

    try {
        const [results] = await db.query(query, [groupId]);
        if (results.length === 0) {
            return res.status(404).send('Group not found');
        }
        res.json(results[0]);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Server error');
    }
});

// Добавление группы
router.post('/', async (req, res) => {
    const { name } = req.body;
    const query = 'INSERT INTO groups (name) VALUES (?)';

    try {
        await db.query(query, [name]);
        res.status(201).send('Group added');
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Server error');
    }
});

// Удаление группы
router.delete('/:id', async (req, res) => {
    const groupId = req.params.id;

    try {
        await db.query('DELETE FROM groups WHERE id = ?', [groupId]);
        res.status(200).send('Group deleted');
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Server error');
    }
});


module.exports = router;

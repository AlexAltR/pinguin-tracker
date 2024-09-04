const express = require('express');
const router = express.Router();
const db = require('../models/db');
const jwt = require('jsonwebtoken');


// Получение списка студентов в группе для публичного доступа
router.get('/public/:groupId', (req, res) => {
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

    db.query(query, [groupId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }
        res.json(results);
    });
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
router.get('/:groupId', (req, res) => {
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

    db.query(query, [groupId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }
        res.json(results);
    });
});

// Добавление студента
router.post('/', (req, res) => {
    const { first_name, middle_name, last_name, group_id } = req.body;
    const query = 'INSERT INTO students (first_name, middle_name, last_name, group_id) VALUES (?, ?, ?, ?)';

    db.query(query, [first_name, middle_name, last_name, group_id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }
        res.status(201).send('Student added');
    });
});

// Удаление студента и связанных записей в таблице penguins
router.delete('/:id', (req, res) => {
    const studentId = req.params.id;

    // Начало транзакции
    db.beginTransaction((err) => {
        if (err) {
            console.error('Transaction error:', err);
            return res.status(500).send('Server error');
        }

        // Сначала удаляем записи из таблицы penguins
        const deletePenguinsQuery = 'DELETE FROM penguins WHERE student_id = ?';
        db.query(deletePenguinsQuery, [studentId], (err, result) => {
            if (err) {
                return db.rollback(() => {
                    console.error('Failed to delete penguins:', err);
                    res.status(500).send('Server error');
                });
            }

            // Затем удаляем студента
            const deleteStudentQuery = 'DELETE FROM students WHERE id = ?';
            db.query(deleteStudentQuery, [studentId], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Failed to delete student:', err);
                        res.status(500).send('Server error');
                    });
                }

                // Завершение транзакции
                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Failed to commit transaction:', err);
                            res.status(500).send('Server error');
                        });
                    }

                    res.status(200).send('Student and related penguins deleted');
                });
            });
        });
    });
});





module.exports = router;

const mysql = require('mysql2');

// Create a pool of connections
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,  // You can adjust this number based on your expected load
    queueLimit: 0
});

module.exports = pool.promise();  // Use the promise-based pool

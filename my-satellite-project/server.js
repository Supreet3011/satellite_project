const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',  // Replace with your actual database username
    password: 'SONU@2002sonu',  // Replace with your actual database password
    database: 'satellite_data1'
};

// Define a route to fetch and send satellite data
app.get('/satellites', async (req, res) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.query('SELECT * FROM Satellites1');
        res.json(rows);
    } catch (error) {
        console.error('Failed to fetch satellites:', error);
        res.status(500).send('Error fetching satellites');
    } finally {
        connection.end();
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

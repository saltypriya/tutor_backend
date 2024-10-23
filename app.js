const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// PostgreSQL connection
const pool = new Pool({
    user: 'postgres',     // Replace with your PostgreSQL username
    host: 'localhost',
    database: 'mydatabase',          // Your database name
    password: 'Rg$74406', // Replace with your PostgreSQL password
    port: 5432,
});

// Define a simple route for the root URL
app.get('/', (req, res) => {
    res.send('Welcome to the User Authentication API!');
});

// Register endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id', [username, hashedPassword]);
        res.status(201).json({ userId: result.rows[0].id });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            res.status(200).json({ message: 'Login successful!' });
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

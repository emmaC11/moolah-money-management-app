//Check location of db.js-> const { pool } = require("../config/db");
const { pool } = require("../config/db");

async function findUserByEmail(email) {
    const [rows] = await pool.query(
        "SELECT user_id, email, password_hash FROM Users WHERE email = ?",
        [email]
    );
    return rows[0] || null;
}

async function findUserByUsername(username) {
    const [rows] = await pool.query(
        "SELECT user_id, email, password_hash FROM Users WHERE username = ?",
        [username]
    );
    return rows[0] || null;
}

async function createUser({ email, username, password_hash }) {
    const [userResult] = await pool.query(
        "INSERT INTO Users (email, username, password_hash) VALUES (?, ?, ?)",
        [email, username, password_hash]
    );
    
    const user_id = userResult.insertId;

    // Added CURDATE() to satisfy the NOT NULL start_date requirement
    await pool.query(
        "INSERT INTO Membership (user_id, membership_type, start_date) VALUES (?, 'free', CURDATE())",
        [user_id]
    );

    return { user_id };
}

module.exports = { 
    findUserByEmail, 
    findUserByUsername, 
    createUser 
};
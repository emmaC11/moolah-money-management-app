//Check location of db.js-> const { pool } = require("../config/db");

async function findUserByEmail(email) {
const [rows] = await pool.query(
"SELECT user_id, email, password_hash, role FROM Users WHERE email = ?",
[email]
);
return rows[0] || null;
}

async function findUserByUsername(username) {
const [rows] = await pool.query(
"SELECT user_id, email, password_hash, role FROM Users WHERE username = ?",
[username]
);
return rows[0] || null;
}

async function createUser({ email, username, password_hash}) {
const [userResult] = await pool.query(
"INSERT INTO Users (email, username, password_hash) VALUES (?, ?, ?)",
[email, username, password_hash]
);
const newUserId = userResult.insertId;
await pool.query("INSERT INTO Membership (user_id) VALUES(?)",
    [newUserId]
);
return {newUserId};
}


module.exports = { findUserByEmail, findUserByUsername,createUser};
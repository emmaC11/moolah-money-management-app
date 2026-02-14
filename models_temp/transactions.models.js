//Check location of db.js-> const { pool } = require("../config/db");
const { pool } = require("../config/db");

async function getTransactionsbyUID(user_id) {
    const [rows] = await pool.query(
        "SELECT transaction_id, category_id, amount, description, type, date FROM Transactions WHERE user_id = ?",
        [user_id]
    );
    return rows; 
}

async function createTransaction({ user_id, category_id, amount, description, type, date }) {
    const [result] = await pool.query(
        "INSERT INTO Transactions (user_id, category_id, amount, description, type, date) VALUES (?, ?, ?, ?, ?, ?)",
        [user_id, category_id, amount, description, type, date]
    );
    return result.insertId;
}

async function deleteTransaction(transaction_id) {
    const [result] = await pool.query(
        "DELETE FROM Transactions WHERE transaction_id = ?",
        [transaction_id]
    );
    return result.affectedRows > 0;
}

module.exports = {
    getTransactionsbyUID,
    createTransaction,
    deleteTransaction
};
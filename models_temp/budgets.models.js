//Check location of db-> const { pool } = require("../config/db");
const { pool } = require("../config/db");

async function getBudgetsByUserId(user_id) {
    const [rows] = await pool.query(
        "SELECT budget_id, budget_name, amount, start_date, end_date, is_active FROM Budgets WHERE user_id = ?",
        [user_id]) 
    return rows; 
}

async function createBudget({ user_id, budget_name, amount, start_date, end_date }) {
    const [result] = await pool.query(
        "INSERT INTO Budgets (user_id, budget_name, amount, start_date, end_date) VALUES (?, ?, ?, ?, ?)",
        [user_id, budget_name, amount, start_date, end_date]
    );
    return result.insertId;
}


async function deleteBudget(budget_id) {
    const [result] = await pool.query(
        "DELETE FROM Budgets WHERE budget_id = ?",
        [budget_id]
    );
    return result.affectedRows > 0;
}

module.exports = {
    getBudgetsByUserId,
    createBudget,
    deleteBudget
};
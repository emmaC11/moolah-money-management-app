//Check location of db-> const { pool } = require("../config/db");
const { pool } = require("../config/db");

async function getGoalsByUserId(user_id) {
    const [rows] = await pool.query(
        "SELECT goal_id, goal_name, target_amount, current_amount, target_date FROM Goals WHERE user_id = ?",
        [user_id]
    );
    return rows;
}

async function createGoal({ user_id, goal_name, target_amount, target_date }) {
    const [result] = await pool.query(
        "INSERT INTO Goals (user_id, goal_name, target_amount, target_date) VALUES (?, ?, ?, ?)",
        [user_id, goal_name, target_amount, target_date]
    );
    return result.insertId;
}

async function deleteGoal(goal_id) {
    const [result] = await pool.query(
        "DELETE FROM Goals WHERE goal_id = ?",
        [goal_id]
    );
    return result.affectedRows > 0;
}

module.exports = {
    getGoalsByUserId,
    createGoal,
    deleteGoal
};
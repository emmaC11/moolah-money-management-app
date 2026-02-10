//Check location of db-> const { pool } = require("../config/db");
async function getGoalsByUserId(user_id) 
{const [rows] = await pool.query("SELECT goal_id, goal_name, target_amount FROM Goals WHERE user_id = ?"
    [user_id]
);
return rows[0] || null;
}

async function createGoal({ user_id, goal_name, target_amount, start_date, end_date})
{const [result] = await pool.query("INSERT INTO Goals (user_id, goal_name, target_amount) VALUES(?,?,?,)",[user_id, goal_name, target_amount])
return result.insertId;
}

async function deleteGoal(goal_id){
const [result]= await pool.query("DELETE FROM Goals WHERE goal_id=?"[goal_id]);
return [result] 
}
module.export= {getGoalsByUserId, createGoal, deleteGoal}
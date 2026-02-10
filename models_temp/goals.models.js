//Check location of db-> const { pool } = require("../config/db");
async function getGoalsByUserId(user_id) 
{const [rows] = await pool.query("SELECT goal_id, goal_name, amount, start_date, end_date FROM Goals WHERE user_id = ?"
    [user_id]
);
return rows[0] || null;
}

async function createGoal({ user_id, goal_name, target_amount, start_date, end_date})
{const [rows] = await pool.query("INSERT INTO Goals (user_id, goal_name, target_amount, start_date, end_date) VALUES(?,?,?,?,?)",[user_id, goal_name, target_amount, start_date, end_date])
return result.insertId;
}


//async function updateGoal({user_id, }
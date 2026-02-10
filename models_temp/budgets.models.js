//Check location of db-> const { pool } = require("../config/db");
async function getBudgetByUserId(user_id) 
{const [rows] = await pool.query("SELECT budget_id, budget_name, amount, start_date, end_date FROM Budgets WHERE user_id = ?"
    [user_id]
);
return rows[0] || null;
}

async function createBudget({ user_id, goal_name, target_amount, start_date, end_date})
{const [result] = await pool.query("INSERT INTO Budgets (user_id, budget_name, amount, start_date, end_date) VALUES(?,?,?,?,?)",[user_id, goal_name, target_amount, start_date, end_date])
return result.insertId;
}

async function deleteGoal(budget_id_id){
const [result]= await pool.query("DELETE FROM Budgets WHERE budget_id=?"[goal_id]);
return [result] 
}
module.export ={getBudgetByUserId, createBudget, deleteGoal}
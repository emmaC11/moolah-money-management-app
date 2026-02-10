//Check location of db.js-> const { pool } = require("../config/db");
async function getCategories(){
    const[rows]= await pool.query("SELECT category_id category_name,category_type, icon, color FROM Categories");
    return rows [0]||null
}
async function getCategorybyName(category_name){
    const[rows]= await pool.query("SELECT category_id category_name,category_type, icon, color FROM Categories WHERE category_name=?"[catergory_name]);
    return rows [0]||null
}

async function getCategoryIcon(category_name){
const[rows]= await pool.query("SELECT icon FROM Categories WHERE category_name=?"[catergory_name]);
    return rows [0]||null
}

async function getCategoryColor(category_name){
const[rows]= await pool.query("SELECT color FROM Categories WHERE category_name=?"[catergory_name]);
    return rows [0]||null
}

async function getCategoryType(category_name){
const[rows]= await pool.query("SELECT type FROM Categories WHERE category_name=?"[catergory_name]);
    return rows [0]||null

}


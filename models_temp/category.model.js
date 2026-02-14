//Check location of db.js-> const { pool } = require("../config/db");
const { pool } = require("../config/db");

async function getCategories() {
    const [rows] = await pool.query(
        "SELECT category_id, category_name, category_type, icon, color FROM Categories"
    );
    return rows;
}

async function getCategoryByName(category_name) {
    const [rows] = await pool.query(
        "SELECT category_id, category_name, category_type, icon, color FROM Categories WHERE category_name = ?",
        [category_name]
    );
    return rows[0] || null;
}

async function getCategoryIcon(category_name) {
    const [rows] = await pool.query(
        "SELECT icon FROM Categories WHERE category_name = ?",
        [category_name]
    );
    return rows[0] ? rows[0].icon : null;
}

async function getCategoryColor(category_name) {
    const [rows] = await pool.query(
        "SELECT color FROM Categories WHERE category_name = ?",
        [category_name]
    );
    return rows[0] ? rows[0].color : null;
}

async function getCategoryType(category_name) {
    const [rows] = await pool.query(
        "SELECT category_type FROM Categories WHERE category_name = ?",
        [category_name]
    );
    return rows[0] ? rows[0].category_type : null;
}

module.exports = {
    getCategories,
    getCategoryByName,
    getCategoryIcon,
    getCategoryColor,
    getCategoryType
};
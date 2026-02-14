//Check location of db.js-> const { pool } = require("../config/db");
const { pool } = require("../config/db");

async function checkMembershipStatus(user_id) {
    const [rows] = await pool.query(
        "SELECT * FROM Membership WHERE user_id = ?",
        [user_id]
    );
    return rows[0] || null;
}

async function upgradeMembershipStatus(user_id) {
    const [result] = await pool.query(
        "UPDATE Membership SET membership_type = 'premium' WHERE user_id = ?",
        [user_id]
    );
    return result.affectedRows > 0;
}

module.exports = {
    checkMembershipStatus,
    upgradeMembershipStatus
};
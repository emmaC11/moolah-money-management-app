//Check location of db.js-> const { pool } = require("../config/db");
async function checkMembershipStatus(user_id) {const[row] =await pool.query("SELECT * FROM Membership HERE user_id=?",
    [user_id]
); 
}

async function upgradeMembershipStatus(user_id){const[result]=await pool.query("UPDATE Membership SET membershiptype ='premium' WHERE user_id=?",
    [user_id]
 );
return [result]}
module.export={checkMembershipStatus, upgradeMembershipStatus}
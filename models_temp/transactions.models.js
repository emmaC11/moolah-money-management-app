//Check location of db.js-> const { pool } = require("../config/db");
async function getTransactionsbyUID(user_id){
    const[rows]= await poolquery("SELECT transaction_id, category_id, amount, description, type, date FROM Transactions WHERE user_id=?"
        [user_id]
    );
return rows[0]||null
}
async function createTransaction({category_id, amount, description, type}){
const[result]=await poolquery("INSERT INTO Transactions(category_id, amount, description, type VALUES(?,?,?,?))",
[category_id, amount, description, type])
return [result]
}

async function deleteTransaction(transaction_id){
    const[result]=await poolquery("DELETE FROM Transactions WHERE transaction_id-?",[transaction_id]) 
    return[result]
}

module.export={getTransactionsbyUID, createTransaction, deleteTransaction}
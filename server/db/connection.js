const mysql = require('mysql')


const pool = mysql.createPool({
    connectionLimit :15,
    user : 'root',
    host : 'localhost',
    database : 'minor_project'
})


module.exports = pool;
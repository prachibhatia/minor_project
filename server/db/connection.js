const mysql = require('mysql');
// const bcrypt = require('bcrypt');

const pool = mysql.createPool({
    connectionLimit :15,
    user : 'root',
    host : 'localhost',
    database : 'minor_project'
})

module.exports = pool;
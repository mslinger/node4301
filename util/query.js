const oracledb = require('oracledb');
const dbconfig = require('./configdb.js');

async function query(statement){
    let connection;

    try{
        connection = await oracledb.getConnection(dbconfig);
        const result = await connection.execute(statement);

        return result.rows;
    }
    catch(err){
        console.error(err);
    }
    finally{
        if (connection) {
            try {
              await connection.close();
            } catch (err) {
              console.error(err);
            }
          }
    }
}

module.exports = query;
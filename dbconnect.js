const {Client} = require("pg");
const dbconfig = {
  user:"postgres",
  password:"dhqkwkd1!",
  host:"localhost",
  port:"5432",
  database:"node"
};

// const dbconfig = {
//   connectionString: process.env.DATABASE_URL
// };

let exp = {
  query:async (q, d) => {
    var client = new Client(dbconfig);
    await client.connect();
    try {
      var results = await client.query(q,d);
    } catch (err){
      client.end();
      throw err;
    }
    client.end();
    return results.rows;
  }
}

module.exports = exp;
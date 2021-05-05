const DBUSER = "root";
const DBPASS = "";
const DATABASE = "adoctor2021"
const HOST = "localhost";
const PORT = 3306;


const config = {
   
    db: {
      host: HOST,
      port: PORT,
      name: DATABASE,
      usr:DBUSER,
      pass:DBPASS
    }
};
   
module.exports = config;



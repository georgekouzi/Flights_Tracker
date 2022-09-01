require('dotenv').config();

var mysql = require('mysql');


// Connect to MySQL data base
function connect(){
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "3untpx3p",
    database: 'flightsData'
  });
  
  return con;
}

function insertToDatabase(data){
  
    var con= connect();
    const period =data.period;
    const airline = data.airline
    const departureAirport = data.departureAirport;
    const arrivalAirport = data.arrivalAirport;
    const typeOfFlight = data.typeOfFlight;
    const departureWeahter = data.departureWeahter;
    const arrivalWeather = data.arrivalWeather ;
    const arrivalStatus = data.arrivalStatus;
    const month = data.month;
    const day = data.day;

    var sql = `INSERT INTO flights (period,month,day, airline,departureAirport,arrivalAirport,typeOfFlight,departureWeahter,arrivalWeather,arrivalStatus )
         VALUES ('${period}','${month}','${day}',' ${airline}', '${departureAirport}', '${arrivalAirport}','${typeOfFlight}','${departureWeahter}','${arrivalWeather}','${arrivalStatus}') `;
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("flight inserted");
        con.end();
        return;
    });

}

function pullFromDB(){
    var con= connect();
     return new Promise(res => {
       con.query(`SELECT * FROM flights`, function (err, result) {
         if (err) {
           throw err;
         }
         res(result);
       })
     });
   }
   
   // The async call function
   async function pullFromDataBase(){
     const result = await pullFromDB();
     return result;
   }
   


module.exports.insertToDatabase = insertToDatabase ;
module.exports.pullFromDataBase = pullFromDataBase;
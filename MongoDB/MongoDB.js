const { MongoClient, ServerApiVersion } = require('mongodb')
const uri = "mongodb+srv://george:3untpx3p@cluster0.kpu9b.mongodb.net/?retryWrites=true&w=majority"; 
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const { Parser } = require('json2csv');
var fs = require('fs');


async function insertToMongoDB(data){
  // Connect + Insert to the MongoDB
  client.connect(async function(err, db) {
    data = JSON.parse(data)

    if (err) throw err;
    var dbo = db.db("FlightsData");
    dbo.collection("flights").insertOne(data, function(err, res) {
      // console.log("mongodb = ", res)
      if (err) throw err;
    }); 
  });
}

// Function that exports the data to CSV (for BigML)
function exportToCsv(){
  client.connect(function(err, db) {
    if (err) throw err;
    var dbo = db.db("FlightsData");
    var query = { };
    dbo.collection("flights").find(query).toArray(function(err, result) {
      if (err) throw err;
      var fields = ['flightNumber','period','month' ,'day', 'airline', 'departureAirport', 'arrivalAirport', 'typeOfFlight', 'departureWeahter'  , 'arrivalWeather' , 'arrivalStatus'];
      const opts = { fields };
      try {
        const parser = new Parser(opts);
        const csv = parser.parse(result);
        var path='../DashboardWithWs/MongoData.csv';
        fs.writeFile(path, csv, function(err,data) {
            if (err) {throw err;}
            
        });
      } catch (err) {
        console.error(err);
      }
      db.close();
    });
  });
}
// exportToCsv();
module.exports.insertToMongoDB = insertToMongoDB;
module.exports.exportToCsv = exportToCsv;
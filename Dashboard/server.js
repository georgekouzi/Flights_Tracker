const express = require('express')
const app = express();
const socketIO = require('socket.io');
const redisSub = require('../Redis/redissub')
const redisPub = require('../Redis/redispub');
const redisRWAdapter = require('../Redis/redisRWAdapter');
// const publishData = require('../DataCollection/PublishData')
const Mongo= require('../MongoDB/MongoDB')
const BigML= require('../bigML/bml');
// const { getTime } = require('../DataCollection/DataFetch');
const port=3000;
// publishData.apiData();
// apiData()
// function apiData(){
//   publishData.apiData();
//   sleep(10000)

// }





app.use(express.static('public'))
app.set('view engine', 'ejs')
redisPub;
var bool =true;
// Function that sending the data to dashboard
function updateNewData(){
  // if(bool){
  // taking the data from redis
  var dataFromRedis= redisSub.getData();
  dataFromRedis.then(async (res) => {
    
    var data = JSON.parse(res);
    
    var flights_counter = getFlightsNumber(data);
    //  console.log(`new data = ${JSON.stringify(new_data)}`)
      
    
 
    var airplains_location= getLngLat(data);
    
    
    
    var TLVweather = getTLVWeather(data,flights_counter.arrFlightsNumber);
    io.emit('weather',TLVweather);
      
    
   
    // Updating new data by using socket.io
    io.emit('flights counter', flights_counter);
   
    io.emit('flights location', airplains_location);
    
    var new_data = await getPrediction(data)
    
    var arr_flights_string = getFlightsDataByNumber(new_data,flights_counter.arrFlightsNumber)
    var dep_flights_string = getFlightsDataByNumber(new_data,flights_counter.depFlightsNumber)
    
    io.emit('flights data1', arr_flights_string) 
    io.emit('flights data2', dep_flights_string) 
  
  });
// }

  setTimeout(updateNewData,45000);
}

app.get('/', (req, res) => {
  redisRWAdapter.flushAll();
  res.render("pages/map")
  updateNewData();
})
function getLngLat(data){
  var locations = [];
  for (let index = 0; index < data.length; index++) {
    const element = data[index];
    const lngLat = {
      lat : element.lat,
      lng : element.lng,
      flightNumber : element.flightNumber
    }
    locations.push(lngLat);
  }
  return locations;
}
function getFlightsNumber(data){
  
  var arr_flights_sum=0,dep_flights_sum=0;
  var arr_flights_number=[],dep_flights_number = [];
  for (let index = 0; index < data.length; index++) {
      if(data[index].departureAirport == 'TLV' ){
        if(getTime(data[index].departureAirport)){
        dep_flights_sum++;
        }
        dep_flights_number.push(data[index].flightNumber)
      }else if(data[index].arrivalAirport == 'TLV'){
        if(getTime(data[index].arrivalAirport)){
        arr_flights_sum++;
        }
        arr_flights_number.push(data[index].flightNumber)
      }
  }
    const output = {
      arrFlightsSum : arr_flights_sum,
      depFlightsSum : dep_flights_sum ,
      arrFlightsNumber : arr_flights_number,
      depFlightsNumber : dep_flights_number
    }  
    return output;
}

 




function getTLVWeather(data,arrFlightsNumber){
 
    for (let j = 0; j < data.length; j++) {
      if (data[j].flightNumber == arrFlightsNumber[0]) {
        return data[j].arrivalWeather;      
      }
      
    }
}


const server = express()
  .use(app)
  .listen(3000, () => console.log(`Listening Socket on http://localhost:3000`));
const io = socketIO(server);

function getFlightsDataByNumber(data,flights){
  
  var str ="" ;
  for (let i = 0; i < flights.length; i++) {
    for (let j = 0; j < data.length; j++) {
    if (data[j].flightNumber == flights[i]) {
      const element = data[j];

      console.log(element)
      if(getTime(element.arrivalTime)||getTime(element.departureTime)){
        console.log(" 15 minuts flight!!!!!!!! ")
      str += `Flight Number is ${element.flightNumber}
          Airline : ${element.airline}
          Departure Airport : ${element.departureAirport}
          Arrival Airport : ${element.arrivalAirport}
          Departure Weahter : ${element.departureWeahter}
          Arrival Weather : ${element.arrivalWeather}
          The flight will be : ${element.arrivalStatus}
          
          `;
    }
  }
    }
  }
     return str;
}
function getTime(timeStamp){
  var time = timeStamp.split(":");
  var hours = parseInt(time[0])*60
  var min = parseInt(time[1])
  var today = new Date();
  var TimeInMin = ((parseInt(today.getHours()))*60 + parseInt(today.getMinutes()));
  
  if(Math.abs((hours+min)- TimeInMin) <= 15){
      return true
  }else return false ;

}

async function getPrediction(data){
  let new_data =[];
  if(data){
    for (let i = 0; i < data.length ; i++ ) {
      const element = data[i];
      await BigML.GetPred(element).then(arrivalStatus =>{
        const obj ={
          flightNumber : element.flightNumber,
          period : element.period,
          month : element.month ,
          day : element.day,
          airline : element.airline,
          departureAirport : element.departureAirport,
          arrivalAirport : element.arrivalAirport,
          typeOfFlight : element.typeOfFlight,
          departureWeahter : element.departureWeahter  ,
          arrivalWeather : element.arrivalWeather,
          arrivalStatus : arrivalStatus,
          arrivalTime : element.arrivalTime,
          departureTime : element.departureTime
        }
        new_data.push(obj)
      })

    }
    return new_data;
  }
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

io.on('connection', (socket) => {
  socket.on('get new model',  async(inputData)=>{
    // bool =false;
    Mongo.exportToCsv();
   await BigML.createModel();
    // bool =true;

    // console.log(inputData)

     
  });
});

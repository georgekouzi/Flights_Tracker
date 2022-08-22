const axios = require('axios');




function getFlights(){
    return new Promise ( res => {
        axios.get(`https://airlabs.co/api/v9/flights?_view=array&_fields=dep_iata,arr_iata,flight_iata&api_key=c2515044-e704-4c46-a60f-03eb10588f30`)
         .then(response => {
            res(response)            
        }).catch(error => {
            console.log(error);
        });
    })

}
function flightINFO(flightIata){
    return new Promise ( res => {
    axios.get(`https://airlabs.co/api/v9/flight?flight_iata=${flightIata}&_view=array
                    &_fields=flight_number,flag,airline_icao,lat,lng,alt,dep_iata,arr_iata,status,airline_icao,dep_time,arr_time,delayed
                    &api_key=c2515044-e704-4c46-a60f-03eb10588f30`)
   
                    .then(response => {
                       res(response)            
                    }).catch(error => {
                        console.log(error);
   });
})
}
function getWeather(countryCode){
    return new Promise ( res => {
        
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${countryCode}&appid=9fa292766dbbd553e2ee998de37af7bc`)
         .then(response => {

            const temperatureK = response.data.main.temp;
            // temperature in celsius
            const weatherData = (temperatureK - 273.15).toFixed(2) ;
               
            // console.log(weatherData)
            res(weatherData)
        
            }).catch(error => {
            console.log(error);
        });
    })
}

function getPeriod(){
    var date_ob = new Date();
    var day = ("0" + date_ob.getDate()).slice(-2);
    var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    var year = date_ob.getFullYear();
    
    var date = year + "-" + month + "-" + day;
    // console.log(date);
    return new Promise ( res => { 
        axios.get('https://www.hebcal.com/converter?cfg=json&start=2021-12-29&end=2022-01-04&g2h=1')
         .then(response => {

            if(response.data.hdates[date]){
                res('holiday')
            }else {
                if(date_ob.getMonth() >= 6  && date_ob.getMonth() <= 8) {
                    res('summer')
                }else{
                    res('normal day')
                }

            }
            
        })
    })
}
// getPeriod()
// getWeather('');
module.exports.getFlights = getFlights;
module.exports.getWeather = getWeather;
module.exports.flightINFO= flightINFO;
module.exports.getPeriod =  getPeriod;
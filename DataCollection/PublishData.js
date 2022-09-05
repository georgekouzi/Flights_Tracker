const kafka = require('../kafka/PublishToKafka/publish');
const sql = require('./MySql/DataStoring');
const data = require('./DataFetch');



// const departure_flights_TLV = await data.realTimeDepartureFlightsTLV();
//     const arrival_flights_TLV = await data.realTimeArrivalFlightsTLV();
//     var realTimeFlightToTLV = departure_flights_TLV.data.response.concat(arrival_flights_TLV.data.response);
//     console.log("realTimeFlightToTLV: ",realTimeFlightToTLV)

//     const allDepartureFlightsToTLV = await data.departureFlightsToTLV();
//     const allarrivalFlightsToTLV = await data.arrivalFlightsToTLV();
//     var flightsToTLV = allDepartureFlightsToTLV.data.response.concat(allarrivalFlightsToTLV.data.response);
//     console.log("flightsToTLV : ",flightsToTLV)


//     const citys = await data.city();
//     console.log("city : ",citys.data.response)
// fb521302-af44-4447-9106-7c151675ef40




function getDay() {
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date();
    let day = weekday[d.getDay()];
    return day;


}
function getMonth() {
    const d = new Date();
    const m = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let month = m[d.getMonth()];
    return month;
}

function getDest(dep_lat_lng, arr_lat_lng) {
    var dest = calcCrow(dep_lat_lng[0], dep_lat_lng[1], arr_lat_lng[0], arr_lat_lng[1])

    if (dest <= 1500) {
        return 'Short Flight';
    } else if (dest <= 3500) {
        return 'Average Flight';
    } else {
        return 'Long Flight';
    }

}
function getStatus(delayed) {

    if (delayed < 15||delayed == null) {
        return 'on time'
    } else if (delayed < 60) {
        return 'Delayed'
    } else {
        return 'severely Delayed'
    }
}

async function publishAndStor() {
    let period,
        airline,
        departureAirport,
        arrivalAirport,
        typeOfFlight,
        departureWeahter,
        arrivalWeather,
        arrivalStatus;

    const p = await data.getPeriod().then(res => period = res);




    // console.log("flights_Response.data.length")

    const departure_flights_TLV = await data.getDepartureFlightsTLV();
    const arrival_flights_TLV = await data.getArrivalFlightsTLV();
    var on_ground_flights = await data.FlightsOnGround();
    // console.log(`departure_flights_TLV =` , departure_flights_TLV.data )
    // console.log(`arrival_flights_TLV  = ${JSON.stringify(arrival_flights_TLV.data)}\n`,)


    var arrTLV = departure_flights_TLV.data.concat(arrival_flights_TLV.data);
   
    // console.log(`\narrTLV lenght = ${arrTLV.length}\n`,on_ground_flights)
    if(on_ground_flights){
        arrTLV.concat(on_ground_flights)
        // console.log(`arrTLV lenght = ${arrTLV.length}\n`,arrTLV)
    }

   
    for (let index = 0; index < arrTLV.length; index++) {
         const element = arrTLV[index];
    // console.log(element[0], element[1], element[2])

    // console.log(element[0],element[1],element[2])



    // flight_number,flag,airline_icao,lat,lng,alt,dep_iata,arr_iata,status,airline_icao,dep_time,arr_time,delayed
    try {
        await data.flightINFO(element[2]).then( async (flightInfo) =>{
        // console.log(element[2])

        // console.log(element[0],element[1],element[2],flightInfo.data? flightInfo.data.response: -1)

        if (flightInfo && flightInfo.data && flightInfo.data.response) {
            airline = flightInfo.data.response.airline_icao;
            departureAirport = element[0];
            arrivalAirport = element[1];

            if (flightInfo.data.response.delayed < 15) {
                arrivalStatus = 'on time'
            } else if (flightInfo.data.response.delayed < 60) {
                arrivalStatus = 'Delayed'
            } else {
                arrivalStatus = 'severely Delayed'
            }
            var arr_lat_lng = [];
            var dep_lat_lng = [];
            await data.getCity(departureAirport,arrivalAirport).then(async (res) => {
                // console.log("citys =",res)
                // console.log("citys1 =",res[1])

                if (res[0]&&res[1]) {
                    // console.log("get city")

                    dep_lat_lng.push(res[0].lat)
                    dep_lat_lng.push(res[0].lng)
                    arr_lat_lng.push(res[1].lat)
                    arr_lat_lng.push(res[1].lng)
                    await data.getWeather(res[0].name).then(async (ans) => {
                        // console.log("citys =",res[0] ,res[1], "Weahter = ", ans)
                        departureWeahter = ans;
                    })
                        await data.getWeather(res[1].name).then(async (ans1) =>{
                            arrivalWeather = ans1;
                        })
                            var dest = calcCrow(dep_lat_lng[0], dep_lat_lng[1], arr_lat_lng[0], arr_lat_lng[1])
                            // console.log(dest,dep_lat_lng,arr_lat_lng)
                            // console.log(dest)
            
                            if (dest <= 1500) {
                                typeOfFlight = 'Short Flight';
                            } else if (dest <= 3500) {
                                typeOfFlight = 'Average Flight';
                            } else {
                                typeOfFlight = 'Long Flight';
                            }
            
                            const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                            const d = new Date();
                            let day = weekday[d.getDay()];
                            const m = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                            let month = m[d.getMonth()];
            
                            const allData = {
                                flightNumber: element[2],
                                period: period,
                                month: month,
                                day: day,
                                airline: airline,
                                departureAirport: departureAirport,
                                arrivalAirport: arrivalAirport,
                                typeOfFlight: typeOfFlight,
                                departureWeahter: departureWeahter,
                                arrivalWeather: arrivalWeather,
                                arrivalStatus: arrivalStatus,
                                lat: departureAirport== 'TLV' ? dep_lat_lng[0] : flightInfo.data.response.lat,
                                lng: departureAirport== 'TLV' ? dep_lat_lng[1] : flightInfo.data.response.lng,
                                arrivalTime: getTime(flightInfo.data.response.arr_time),
                                departureTime: getTime(flightInfo.data.response.dep_time)
            
            
                            }
                                    // console.log(allData)

                            if (allData.flightNumber && allData.airline && allData.arrivalAirport && allData.arrivalWeather
                                && allData.departureAirport && allData.departureWeahter && allData.lat && allData.lng
                                && allData.arrivalStatus && allData.typeOfFlight && allData.period) {
                                // sql.insertToDatabase(allData);
                                console.log(allData)
                                // console.log("befor publishing to kafka")
                                await kafka.publish(allData);
            
                            }
  
       

              

                }

                    });
            
          

            



        }
    })

    } catch (error) {

    }


}


setTimeout(publishAndStor, 40000)
}






function getTime(timeStamp) {
     time = timeStamp.trim().split(/\s+/)[1];
// console.log( time)

    return time

}

function calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

// Converts numeric degrees to radians
function toRad(Value) {
     Value * Math.PI / 180;
    }
publishAndStor();
module.exports.apiData = publishAndStor;

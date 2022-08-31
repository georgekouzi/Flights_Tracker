// https://github.com/bigmlcom/bigml-node/blob/master/docs/index.md
// https://www.dataem.com/bigml
// Don't run the all code all the time - produce a model ONCE and use for predictions from now on
// Look for an asyc version.
const mongo = require('../MongoDB/MongoDB')
var MODEL = 'model/630f2d6cbf85ee1265004877'; 
var bigml = require('bigml');


async function  createModel(){

  var connection = new bigml.BigML('georgekouzi','54a157821e41db27c27380d9823dc563db53f214')

  var source = new bigml.Source(connection);


  source.create('./MongoData.csv', function(error, sourceInfo) {


    if (!error && sourceInfo) {
      var dataset = new bigml.Dataset(connection);


      
      dataset.create(sourceInfo, function(error, datasetInfo) {
        if (!error && datasetInfo) {
          var model = new bigml.Model(connection);
         
          model.create(datasetInfo, function (error, modelInfo) {
            if (!error && modelInfo) {
              // console.log("predictionInput: "+JSON.stringify(modelInfo))
              MODEL = modelInfo.resource;
              console.log("\nModel number = " + modelInfo.resource);
            }
          
          });
        }
      });
    }
  });
}
async function predictTopic(element){
  
  // console.log("\nthe data = " ,flightNumber,period,month,day,airline,departureAirport,arrivalAirport,typeOfFlight,departureWeahter,arrivalWeather+"\n")
 
  return  new Promise( res =>{
 
    var connection = new bigml.BigML('georgekouzi','54a157821e41db27c27380d9823dc563db53f214')

              var predictionInput= {
                flightNumber : element.flightNumber,
                period : element.period,
                month : element.month ,
                day : element.day,
                airline : element.airline,
                departureAirport : element.departureAirport,
                arrivalAirport : element.arrivalAirport,
                typeOfFlight : element.typeOfFlight,
                departureWeahter : element.departureWeahter  ,
                arrivalWeather : element.arrivalWeather
              } 
              // https://bigml.com/dashboard/model/630e2905aba2df5330000c77
              var prediction =  new bigml.Prediction(connection);
              if(predictionInput && prediction ){
                // console.log("predictionInput: "+JSON.stringify(predictionInput))
              
                prediction.create(MODEL,predictionInput, async function(error, prediction) {
                if(error) throw error;

              const output = await prediction.object.probabilities;
              console.log("model num : \n"+MODEL)
              // console.log("prediction.object: \n\n"+JSON.stringify(prediction.object))


              var num1 = output[0][1],num2= output[1][1],num3= output[2][1];
              if(num1 > num2 && num1 > num3) {
                res( output[0][0]);
                return;
                }
                else if (num2 >= num1 && num2 >= num3) {
                res( output[1][0]);
                return;
                }
                else {
                  res( output[2][0]);
                return;
                
                }


                
        });
    
      }
    }); 
}

async function GetPred(element){
  // console.log("\nflights data = ",flightNumber,period,month,day,airline,departureAirport,arrivalAirport,typeOfFlight,departureWeahter,arrivalWeather)
 if(element){
  // console.log("element- ",element)
  var ans =  predictTopic(element);
  return ans;
 }
 return;
}

var predictionInput= {
  flightNumber :"5123",
  period : "summer",
  month : "August" ,
  day : "Monday",
  airline : "AIZ",
  departureAirport : "TLV",
  arrivalAirport : "AMS",
  typeOfFlight : "short",
  departureWeahter : "31.62"  ,
  arrivalWeather : "31.69"
} 

// createModel()
// predictTopic(predictionInput).then(res=> console.log(res));

// predictTopic("5013","summer","February","Tuesday","AIZ","TLV","AMS","short","31.62","31.69").then(res=> console.log(res));

// predictTopic("5134","summer","May","Friday","AIZ","TLV","AMS","short","31.62","31.69").then(res=> console.log(res));
// createModel()

// module.exports.predictTopic= predictTopic;
module.exports.GetPred = GetPred;
module.exports.createModel=createModel


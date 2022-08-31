const uuid = require("uuid");
const Kafka = require("node-rdkafka");



// From data entry to kafka
const kafkaConf = {
  "group.id": "kafka",
  "metadata.broker.list":"moped-01.srvs.cloudkafka.com:9094,moped-02.srvs.cloudkafka.com:9094,moped-03.srvs.cloudkafka.com:9094".split(","),
  "socket.keepalive.enable": true,
  "security.protocol": "SASL_SSL",
  "sasl.mechanisms": "SCRAM-SHA-256",
  "sasl.username": "cp2d43br",
  "sasl.password": "TgdA_puHAnYgYxr7p7gENUKgqJuEDPca",
  "debug": "generic,broker,security"
};

const prefix = "cp2d43br-";
const topic = `${prefix}new`;
const producer = new Kafka.Producer(kafkaConf);

const genMessage = m => new Buffer.alloc(m.length,m);

producer.on("ready", function(arg) {
  console.log(`producer ${arg.name} ready.`); 
  
});

producer.connect();

module.exports.publish= function (msg){   
  m=JSON.stringify(msg);
  console.log(m); 
  producer.produce(topic, -1, genMessage(m), uuid.v4());    
  console.log("finish kafka"); 
 
}



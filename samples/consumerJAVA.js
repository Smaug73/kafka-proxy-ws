'use strict';

const { option } = require('commander');
const { Console } = require('console');
const WebSocket = require('ws'),
    fs = require('fs'),
    program = require('commander');

//let server = 'ws://localhost:9999/';
//let server = 'ws://localhost:8080/java-websocket/kafka-connector/';
let server = 'ws://localhost:8080//java-websocket/kafka-connector/';
//let server = 'ws://connector-kafka-ws-promenade-lyon.apps.kube.rcost.unisannio.it/java-websocket/kafka-connector/';

let ws = {};
let offset = 0;
let count = 0;

let auth = process.env.KAFKA_AUTH;



program
// .option('-t, --topic <topics...>', 'topic (required)')
  .option('-ul, --upperLeft <upperLeft...>', 'upperLeft (required)')
  .option('-lr, --lowerRight <lowerRight...>', 'lowerRight (required)')
  //.option('-c, --consumer <value>', 'consumer group (required)')
  .option('-n, --num [value]', 'number of messages or batches', 100)
  .option('-o, --offset [value]', 'manually set offset position')
  .option('-x, --nooffset', 'rely on server for offset')
  .option('-p, --partition [value]', 'option partition (default is 0)')
  .parse(process.argv);

const options = program.opts(); 

//let topic = options.topic;
let upperLeft = options.upperLeft;
let lowerRight = options.lowerRight;
//let consumer = options.consumer;

let consumer = createConsumerGroup();
//let consumer = 1;
//let consumer = 1;
//console.log("test hashcode: "+consumer); // 9b74c9897bac770ffc029102a200c5de

//let consumer = 

let numMessages = Number.parseInt(program.num);
let programOffset = options.offset ? Number.parseInt(options.offset) : null;
let noOffset = options.nooffset;
let partition = options.partition;

//console.log("Topics: "+topic)

//for(let i=0; i<topic.length; i++)
//    console.log("Topic: "+topic[i])

//if (!topic || !consumer) {
//    program.outputHelp();
//    process.exit(1);
//}


if (!upperLeft || !lowerRight || !consumer) {
    program.outputHelp();
    process.exit(1);
}


//const topicsString = getTopic(upperLeft[0],upperLeft[1],lowerRight[0],lowerRight[1]);
var topicsString = syncGetTopic(upperLeft[0],upperLeft[1],lowerRight[0],lowerRight[1]);
console.log("TEST: "+topicsString);

let topic;

if(topicsString.length > 2){
    topicsString= topicsString.substring(1,topicsString.length-1);
    topicsString= topicsString.replace(/['"]+/g, '')
    topic = topicsString.split(",");
    console.log("\ntopicsString: "+topicsString);
    console.log("\ntopics: "+topic);
    for(let i=0; i<topic.length; i++){
        topic[i]=topic[i]+"-Northbound";
        console.log("Topic: "+topic[i]);
    }
    console.log("\ntopics AFTER: "+topic);
}


 
// open or create a file
let filePath = './offsets/' + topic + '_offset.txt';

// decide whether to send up partition param
let partitionParam = partition ? '&partition=' + partition : '';

// if nooffset = false, rely on locally tracked offset 
if (!noOffset) {
    let loadedOffset = 0;
    try {
        loadedOffset = Number.parseInt(fs.readFileSync(filePath, 'utf8')) + 1;
    } catch (ex) {
        fs.writeFileSync(filePath, '0');
    }
    let offset;
    if (programOffset != null) {
        offset = programOffset;
        console.log('using offset from program params: ' + programOffset);
    }
    else {
        offset = loadedOffset;
        console.log('loading last known offsets from file: ' + loadedOffset);
    }
    let options = auth ? {headers: { Authorization: auth}} : null;
    console.log('option auth: '+options);

    // for(let i=0; i<topic.length; i++){
    //     console.log("\n")
    //     ws[topic[i]] = new WebSocket(server + '?topics=' + topic[i] + '&groupId=' + consumer + '&offset=' + offset + partitionParam, options);
    // }        
}
// if nooffset is supplied, rely on server
else {
    console.log('nooffset supplied, relying on server');
    console.log(server + '?topics=' + topic + '&groupId=' + consumer + partitionParam)
    let options = auth ? {headers: { Authorization: auth}} : null;
    console.log('option auth: '+options); 

    //ws[topic] = new WebSocket(server + '?topic=' + topic + '&consumerGroup=' + consumer + partitionParam, options);        
    // for(let i=0; i<topic.length; i++){
    //     console.log("\n") 
    //     ws[topic[i]] = new WebSocket(server + '?topic=' + topic[i] + '&consumerGroup=' + consumer + '&offset=' + offset + partitionParam, options);
    // }

    ws[topic] = new WebSocket(server + '?topics=' + topic + '&groupId=' + consumer);
   
}


// for(let i=0; i<topic.length; i++){

//     ws[topic[i]].on('open', () => {
//         console.log('Opened socket to server for topic ' + topic[i]+'\n');
//     });

//     ws[topic[i]].on('error', (error) => {
//         console.log(error);
//     });

//     ws[topic[i]].on('message', (data, flags) => {
//         // flags.binary will be set if a binary data is received. 
//         // flags.masked will be set if the data was masked.
//         console.log(typeof data) 
//         let batch  = JSON.parse(data);
//         offset = batch[batch.length-1].offset;
        
//         //FIX for writing all messages
//         for(let j=0; j<=batch.length-1; j++ ){
//             console.log(topic[i])
//             console.log(`${JSON.stringify(batch[j])}\n`);
//         }

//     }); 
// }

ws[topic].on('open', () => {
    console.log('Opened socket to server for topic ' + topic+'\n');
});

ws[topic].on('error', (error) => {
    console.log(error);
    console.log("error");
});

ws[topic].on('close', (error) => {
    console.log(error);
    console.log("close");
});

let counttt =0;
ws[topic].on('message', (data, flags) => {
    // flags.binary will be set if a binary data is received. 
    // flags.masked will be set if the data was masked.
    console.log(typeof data)
    console.log(data) 
    // let batch  = JSON.parse(data);
    // offset = batch[batch.length-1].offset;
    // counttt+=1;
    // if(counttt<10){
    //     console.log(typeof data)
    //     console.log(data)
    // }
    // //FIX for writing all messages
    // for(let j=0; j<=batch.length-1; j++ ){
    //     console.log(topic[0])
    //     console.log(`${JSON.stringify(batch[j])}\n`);
    // }

}); 



process.on('SIGINT', (something) => {
    console.log('Exiting from Ctrl-C... latest offset received from kafka: ' + offset);
    fs.writeFileSync(filePath, offset);
    //ws[topic].close();
    ws[topic].terminate();
    process.exit(1);
});

process.on('exit', (something) => {
    console.log('Exiting from graceful exit... latest offset received from kafka: ' + offset);
    //fs.writeFileSync(filePath, offset);
    //ws[topic].close();
    //ws[topic].terminate();
    process.exit(1);
});



async function getTopic(upperLeft_x, upperLeft_y, lowerRight_x, lowerRight_y){

    const http = require('http')
    const options = {
        hostname: 'area-name-service-promenade.router.default.svc.cluster.local',
        //port: 443,
        path: '/promenadeAreaNameService/rest/areaService/areas?upperLeft='+upperLeft_x+','+upperLeft_y+'&lowerRight='+lowerRight_x+','+lowerRight_y,
        method: 'GET'
    }

    const req = http.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)

        res.on('data', async d =>{
            process.stdout.write(d);
            let result = await d;

            //let promise = new Promise(())=>;
            return result.toString();
        })
    })

    req.on('error', error => {
        console.error(error)
        return "[]";
    })

    req.end()
}

function createConsumerGroup(){
    var ip = require("ip");
    console.log ("DEBUG IP: "+ ip.address() );
    let consumer = (Date.now().toString())+ip.address();
    var hash = 0;
    if (consumer.length == 0) return hash;
    for (let i = 0; i < consumer.length; i++) {
        let char = consumer.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    hash=Math.abs(hash);
    return hash;
}


function syncGetTopic(upperLeft_x, upperLeft_y, lowerRight_x, lowerRight_y){
    var request = require('sync-request')
    const options = {
        hostname: 'promenadeareanameservice-promenade-lyon.apps.kube.rcost.unisannio.it',
        //port: 443,
        path: '/promenadeAreaNameService/rest/areaService/areas?upperLeft='+upperLeft_x+','+upperLeft_y+'&lowerRight='+lowerRight_x+','+lowerRight_y,
        method: 'GET'
    }

    var res = request(options.method, "http://"+options.hostname+options.path);
    console.log(res.getBody('utf8'));
    return res.getBody('utf8');
}
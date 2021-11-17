'use strict';

const { option } = require('commander');
const WebSocket = require('ws'),
    fs = require('fs'),
    program = require('commander');

let server = 'ws://localhost:9999/';

let ws = {};
let offset = 0;
let count = 0;

let auth = process.env.KAFKA_AUTH;



program
  .option('-t, --topic <topics...>', 'topic (required)')
  .option('-c, --consumer <value>', 'consumer group (required)')
  .option('-n, --num [value]', 'number of messages or batches', 100)
  .option('-o, --offset [value]', 'manually set offset position')
  .option('-x, --nooffset', 'rely on server for offset')
  .option('-p, --partition [value]', 'option partition (default is 0)')
  .parse(process.argv);

const options = program.opts(); 

let topic = options.topic;
let consumer = options.consumer;
let numMessages = Number.parseInt(program.num);
let programOffset = options.offset ? Number.parseInt(options.offset) : null;
let noOffset = options.nooffset;
let partition = options.partition;

console.log("Topics: "+topic)

for(let i=0; i<topic.length; i++)
    console.log("Topic: "+topic[i])

if (!topic || !consumer) {
    program.outputHelp();
    process.exit(1);
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

    for(let i=0; i<topic.length; i++){
        console.log("\n")
        ws[topic[i]] = new WebSocket(server + '?topic=' + topic[i] + '&consumerGroup=' + consumer + '&offset=' + offset + partitionParam, options);
    }        
}
// if nooffset is supplied, rely on server
else {
    console.log('nooffset supplied, relying on server');
    console.log(server + '?topic=' + topic[0] + '&consumerGroup=' + consumer + partitionParam)
    let options = auth ? {headers: { Authorization: auth}} : null;
    console.log('option auth: '+options); 

    //ws[topic] = new WebSocket(server + '?topic=' + topic + '&consumerGroup=' + consumer + partitionParam, options);        
    for(let i=0; i<topic.length; i++){
        console.log("\n") 
        ws[topic[i]] = new WebSocket(server + '?topic=' + topic[i] + '&consumerGroup=' + consumer + '&offset=' + offset + partitionParam, options);
    }
}


for(let i=0; i<topic.length; i++){

    ws[topic[i]].on('open', () => {
        console.log('Opened socket to server for topic ' + topic[i]+'\n');
    });

    ws[topic[i]].on('error', (error) => {
        console.log(error);
    });

    ws[topic[i]].on('message', (data, flags) => {
        // flags.binary will be set if a binary data is received. 
        // flags.masked will be set if the data was masked. 
        let batch  = JSON.parse(data);
        offset = batch[batch.length-1].offset;
        
        //FIX for writing all messages
        for(let j=0; j<=batch.length-1; j++ ){
            console.log(topic[i])
            console.log(`${JSON.stringify(batch[j])}\n`);
        }

    }); 
}



process.on('SIGINT', (something) => {
    console.log('Exiting from Ctrl-C... latest offset received from kafka: ' + offset);
    fs.writeFileSync(filePath, offset);
    process.exit(1);
});

process.on('exit', (something) => {
    console.log('Exiting from graceful exit... latest offset received from kafka: ' + offset);
    fs.writeFileSync(filePath, offset);
    process.exit(1);
});

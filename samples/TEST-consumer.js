'use strict';

const WebSocket = require('ws'),
    fs = require('fs'),
    program = require('commander');

let server = 'ws://localhost:9999/';

let ws = {};
let offset = 0;
let count = 0;

let auth = process.env.KAFKA_AUTH;

/*
const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}

for (const name of Object.keys(nets)) {
    console.log("DEBUG Address : name: "+name+" result: "+results[name]);
}
*/

var ip = require("ip");
console.log ("DEBUG IP: "+ ip.address() );

program
  .option('-t, --topic <value>', 'topic (required)')
  .option('-c, --consumer <value>', 'consumer group (required)')
  .option('-n, --num [value]', 'number of messages or batches', 100)
  .option('-o, --offset [value]', 'manually set offset position')
  .option('-x, --nooffset', 'rely on server for offset')
  .option('-p, --partition [value]', 'option partition (default is 0)')
  .parse(process.argv);

/*  
let topic = program.topic;
let consumer = program.consumer;
let numMessages = Number.parseInt(program.num);
let programOffset = program.offset ? Number.parseInt(program.offset) : null;
let noOffset = program.nooffset;
let partition = program.partition;
 */
const options = program.opts(); 

let topic = options.topic;
let consumer = options.consumer;

var crypto = require('crypto');
var name = 'braitsch';
var hash = crypto.createHash('md5').update(consumer).digest('hex');
console.log(hash); // 9b74c9897bac770ffc029102a200c5de


let numMessages = Number.parseInt(program.num);
let programOffset = options.offset ? Number.parseInt(options.offset) : null;
let noOffset = options.nooffset;
let partition = options.partition;





//if (!topic || !consumer) {
//    program.outputHelp();
//    process.exit(1);
//} 
 
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
    ws[topic] = new WebSocket(server + '?topic=' + topic + '&consumerGroup=' + consumer + '&offset=' + offset + partitionParam, options);        
}
// if nooffset is supplied, rely on server
else {
    console.log('nooffset supplied, relying on server');
    console.log(server + '/?topic=' + topic + '&consumerGroup=' + consumer + partitionParam)
    let options = auth ? {headers: { Authorization: auth}} : null; 
    ws[topic] = new WebSocket(server + '?topic=' + topic + '&consumerGroup=' + consumer + partitionParam, options);        
}

ws[topic].on('open', () => {
    console.log('Opened socket to server for topic ' + topic);
});

ws[topic].on('error', (error) => {
    console.log(error);
});

ws[topic].on('message', (data, flags) => {
    // flags.binary will be set if a binary data is received. 
    // flags.masked will be set if the data was masked. 
    let batch  = JSON.parse(data);
    offset = batch[batch.length-1].offset;
    console.log(`Received a batch of messages from kafka. Size: ${batch.length}, last offset: ${offset}, lastMessage:\n${JSON.stringify(batch[batch.length-1])}`);
});

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
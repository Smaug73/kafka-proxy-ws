'use strict';

console.log("ciao");

//const response = fetch('http://area-name-service-promenade.router.default.svc.cluster.local/promenadeAreaNameService/rest/areaService/areas?upperLeft=45.768377,4.809764&lowerRight=45.762576,4.826136');
//const myJson = response.json(); //extract JSON from the http response
// do something with myJson
//console.log(myJson);

const http = require('http')
const options = {
  hostname: 'area-name-service-promenade.router.default.svc.cluster.local',
  //port: 443,
  path: '/promenadeAreaNameService/rest/areaService/areas?upperLeft=45.768377,4.809764&lowerRight=45.762576,4.826136',
  method: 'GET'
}

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)

  let body = [];

  res.on('data',d => {
    //body.push(chunk);
    process.stdout.write(d.toString());
    
    let topicsString= d.toString();

    if(topicsString.length > 2){
        topicsString= topicsString.substring(1,topicsString.length-1);
        topicsString= topicsString.replace(/['"]+/g, '')
        let topics = topicsString.split(",");
        console.log("\ntopicsString: "+topicsString);
        console.log("\ntopics: "+topics);
        for(let i=0; i<topics.length; i++)
            console.log("Topic: "+topics[i])
        //console.log("\n"+topics[0]);
    }

    //for (const value of body.values()) {
        //console.log(value);
      //}
    //process.stdout.write(typeof d);
  })
})

req.on('error', error => {
  console.error(error)
})

req.end()


getTopic(45.768377,4.809764,45.762576,4.826136);


function getTopic(upperLeft_x, upperLeft_y, lowerRight_x, lowerRight_y){

    const http = require('http')
    const options = {
        hostname: 'area-name-service-promenade.router.default.svc.cluster.local',
        //port: 443,
        path: '/promenadeAreaNameService/rest/areaService/areas?upperLeft='+upperLeft_x+','+upperLeft_y+'&lowerRight='+lowerRight_x+','+lowerRight_y,
        method: 'GET'
    }

    const req = http.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)

        res.on('data', d =>{
            process.stdout.write(d);
            let result =d;
            console.log("\nTEST FUNZIONE CHE NON FUNZIONA: "+d.toString());
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
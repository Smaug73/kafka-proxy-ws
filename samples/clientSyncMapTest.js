'use strict';

console.log("ciao");

//const response = fetch('http://area-name-service-promenade.router.default.svc.cluster.local/promenadeAreaNameService/rest/areaService/areas?upperLeft=45.768377,4.809764&lowerRight=45.762576,4.826136');
//const myJson = response.json(); //extract JSON from the http response
// do something with myJson
//console.log(myJson);

var request = require('sync-request')
const options = {
  hostname: 'area-name-service-promenade.router.default.svc.cluster.local',
  //port: 443,
  path: '/promenadeAreaNameService/rest/areaService/areas?upperLeft=45.768377,4.809764&lowerRight=45.762576,4.826136',
  method: 'GET'
}

var res = request(options.method, "http://"+options.hostname+options.path);
console.log(res.getBody('utf8')); 

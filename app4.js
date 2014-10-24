var express = require('express');
var async = require('async');
var app = express();
var request = require('request');
var _ = require('lodash');

var minPort = 1024;
//var maxPort = 65535;
var maxPort = 2553;


function getRandomNumber() {
  var min = 0;
  var max = 255;
  var num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
}

function getRandomPort() {
  var port = Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort;
  return port;
}

function mergeByProperty(arr1, arr2, prop) {
  _.each(arr2, function (arr2obj) {
    var arr1obj = _.find(arr1, function (arr1obj) {
      return arr1obj[prop] === arr2obj[prop];
    });

    //If the object already exist extend it with the new values from arr2, otherwise just add the new object to arr1
    arr1obj ? _.extend(arr1obj, arr2obj) : arr1.push(arr2obj);
  });
}

var x = getRandomNumber();
var y = getRandomNumber();
var port2 = getRandomPort();
var peers = [];

console.log('server on ' + port2);


app.get('/coordinates', function (req, res) {
  res.send(JSON.stringify({x: x, y: y}));
});

app.get('/ports', function (req, res) {
  res.send('port:' + port2);
});

app.get('/peers', function (req, res) {
  res.send(JSON.stringify(peers));
});

app.listen(port2);

function scan(port, done) {
  port = port + minPort;
  if (port2 == port) {
    done(null)
  } else {
    var url = 'http://localhost:' + port + '/coordinates';
    //  console.log(port, url);
    request(url, function (error, response, body) {
      //console.log(error);
      if (!error && response.statusCode == 200) {
        //console.log(JSON.parse(response.body).x);
        var coordinates = JSON.parse(response.body);
        var url2 = 'http://localhost:' + port + '/peers';
        request(url2, function (error2, response2, body2) {
          if (!error2 && response2.statusCode == 200) {

            var peerslist = JSON.parse(response2.body);
            //peers.push({port: port, coordinates: [coordinates.x, coordinates.y]});
            var peer = [{port: port, coordinates: [coordinates.x, coordinates.y]}];
            mergeByProperty(peers, peer, 'port');
            mergeByProperty(peers, peerslist, 'port');
            console.log('peer found ',peer);

          }
          done(null);
        });

      } else {
        done(null);
      }

    })
  }
}

//var ports = new Array(64511);
//var N = 64511;
var N = maxPort - minPort + 1;
var ports = Array.apply(null, {length: N}).map(Number.call, Number);


//var ports = new Array(6);


setTimeout(function () {
  async.eachLimit(ports, 20, scan, function (err) {
    if(err){
      console.log(err);
    }

    console.log('peers are ',peers);
  });
}, 10000);
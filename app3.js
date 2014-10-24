var cluster = require('cluster');
var worker;

var port2;

function getRandomPort() {
    var min = 1024 + 1;
    var max = 49151;
    var port =Math.floor(Math.random() * (max - min + 1)) + min;
//    if(port==8080){
//        return getRandomPort();
//    }
    return port;
}

function getRandomNumber() {
    var min = 0;
    var max = 255;
    var num =Math.floor(Math.random() * (max - min + 1)) + min;
    return num;
}


if (cluster.isMaster) {

    port2 = getRandomPort();

    var cpuCount = require('os').cpus().length;

    var x = getRandomNumber();
    var y = getRandomNumber();

    for (var i = 0; i < cpuCount; i++) {
        worker = cluster.fork();
//        console.log(worker.id);
        worker.on('message', function(msg) {
            if (msg.port) {
                console.log('Worker ' + this.id+ ' to master: ', msg.port);
                this.send({ port: port2});
                this.send({ coordinates:{x:x,y:y}});
            }
        });

    }

    cluster.on('exit', function (worker) {
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();
    });

} else {

    var express = require('express');
    var app = express();
//    var port1= 8080;
    var x,y;

    app.get('/', function (req, res) {
        res.send('Hello from Worker ' + cluster.worker.id);
    });

    app.get('/coordinates', function (req, res) {
        res.send('x:'+x+' y:'+y);
    });

    app.get('/ports', function (req, res) {
//        res.send('port1:'+port1+' port2:'+port2);
      res.send('port:'+port2);
    });

    process.on('message', function (msg) {
        if (msg.port) {
            console.log('Master to worker ' +cluster.worker.id+ ': ', msg.port);

            port2 =msg.port;
            app.listen(port2);
//            app.listen(port1);
        }
        if(msg.coordinates){
            x =msg.coordinates.x;
            y =msg.coordinates.y;
        }
    });

    process.send({ port: 'send me port number' });

}
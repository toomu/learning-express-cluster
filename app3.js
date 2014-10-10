var cluster = require('cluster');
var worker;

var port2;

function getRandomPort() {
    var min = 1024 + 1;
    var max = 49151;
    var port =Math.floor(Math.random() * (max - min + 1)) + min;
    if(port==8080){
        return getRandomPort();
    }
    return port;
}


if (cluster.isMaster) {

    port2 = getRandomPort();

    var cpuCount = require('os').cpus().length;


    for (var i = 0; i < cpuCount; i++) {
        worker = cluster.fork();
//        console.log(worker.id);
        worker.on('message', function(msg) {
            if (msg.port) {
                console.log('Worker ' + this.id+ ' to master: ', msg.port);
                this.send({ port: port2});
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
    app.get('/', function (req, res) {
        res.send('Hello from Worker ' + cluster.worker.id);
    });

    process.on('message', function (msg) {
        if (msg.port) {
            console.log('Master to worker ' +cluster.worker.id+ ': ', msg.port);

            app.listen(msg.port);
            app.listen(8080);
        }
    });

    process.send({ port: 'send me port number' });

}
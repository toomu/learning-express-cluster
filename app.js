// Include the cluster module
var cluster = require('cluster');

function getRandomPort() {
    var min = 1024 + 1;
    var max = 49151;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var port2;

// Code to run if we're in the master process
if (cluster.isMaster) {

    port2 = getRandomPort();
    console.log(port2);

    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        var proc = cluster.fork();
        proc.send('hello');
    }

    process.on('message', function(message) {
        console.log('message from child: ', message);
//        proc.send(port2);
        process.send(port2);
    });



    // Listen for dying workers
    cluster.on('exit', function (worker) {

        // Replace the dead worker, we're not sentimental
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();

    });

// Code to run if we're in a worker process
} else {

    // Include Express
    var express = require('express');

    // Create a new Express application
    var app = express();

    // Add a basic route – index page
    app.get('/', function (req, res) {
        res.send('Hello from Worker ' + cluster.worker.id);
    });

    // Bind to a port
    app.listen(8080);

    cluster.on('message', function(){
        console.log(arguments);
    })
    app.listen(port2);
//    cluster.send('port');






    console.log('Worker ' + cluster.worker.id + ' running!');

}
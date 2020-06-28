'use strict';

/**
 * Set variables
 */
var status = 0;

var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var deviceConnectionString = 'HostName=master-iot-hub.azure-devices.net;DeviceId=test-device;SharedAccessKey=bbsSlPsfzcbOrA6ENWsh2ZtjMJ/e0ygtR5rnB0SFevU=';
var client = clientFromConnectionString(deviceConnectionString);

/**
 * Functions
 */
function printResultFor(op) {
    return function printResult(err, res) {
        if (err) console.log(op + ' error: ' + err.toString());
        if (res) console.log(op + ' status: ' + res.constructor.name);
    };
}

// Handle request from Azure
var connectCallback = function (err) {
    if (err) {
        console.log('Could not connect: ' + err);
    } else {
        console.log('Client connected');
     
        // Handle actions from Azure IoT Hub
        client.on('message', function(msg){
            console.log('=====================');
            console.log(msg.data);
            if (msg.data == 'on') {
                console.log("led.turnOn()");
                status = 1;
            } else {
                console.log("led.turnOff()");
                status = 0;
            }
            client.complete(msg, printResultFor('completed'));    
        });

        // Create a message and send it to the IoT Hub every second
        setInterval(function(){
          // Get the current time as Unix time
          var now = new Date();
          var time = now.getTime();
          var data = JSON.stringify({ 
            deviceId: 'test-device',
            timestamp: time,
            temperature: getRandomIntInclusive(21, 24),
            humidity: getRandomIntInclusive(13, 18),
          });
          var message = new Message(data);
          console.log("Sending message: " + message.getData());
          client.sendEvent(message, printResultFor('send'));
        }, 5000);

    }
}  

// Close Script
function onExit(err) {
    console.log('ending')
    process.exit()
    if (typeof err != 'undefined')
        console.log(err)
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Open client and start sending information to Azure IoT Hub
client.open(connectCallback);

process.on('SIGINT', onExit)
/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */

/*
A simple node.js application intended to blink the onboard LED on the Intel based development boards such as the Intel(R) Galileo and Edison with Arduino breakout board.

MRAA - Low Level Skeleton Library for Communication on GNU/Linux platforms
Library in C/C++ to interface with Galileo & other Intel platforms, in a structured and sane API with port nanmes/numbering that match boards & with bindings to javascript & python.

Steps for installing MRAA & UPM Library on Intel IoT Platform with IoTDevKit Linux* image
Using a ssh client: 
1. echo "src maa-upm http://iotdk.intel.com/repos/1.1/intelgalactic" > /etc/opkg/intel-iotdk.conf
2. opkg update
3. opkg upgrade

Article: https://software.intel.com/en-us/html5/articles/intel-xdk-iot-edition-nodejs-templates
*/

/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */

/*
Node.js application for connecting the Intel Edison Arduino to IBM Bluemix.
Sends data from an analog sensor on analog pin zero.
Requires registration on Bluemix. Edit the following to your Bluemix registration values:
ORG
TYPE
ID
AUTHTOKEN
*/
var ORG = '82upc0';
var TYPE = 'NanoEdison';
var ID = '90b6860a6f47';
var AUTHTOKEN = '0QUb7to8Ot0sQ8FtNO';

//Uses mqtt.js, see package.json. More info at: 
//https://www.npmjs.com/package/mqtt
var mqtt = require('mqtt');

var PROTOCOL = 'mqtt';
var BROKER = ORG + '.messaging.internetofthings.ibmcloud.com';
var PORT = 1883;

//Create the url string
var URL = PROTOCOL + '://' + BROKER;
URL += ':' + PORT;
//URL is e.g. 'mqtt://xrxlila.messaging.internetofthings.ibmcloud.com:1883'

var CLIENTID = 'd:' + ORG;
CLIENTID += ':' + TYPE;
CLIENTID += ':' + ID;
//CLIENTID -s e.g. d:xrxila:edison-air:784b87a801e9

var AUTHMETHOD = 'use-token-auth';

var client = mqtt.connect(URL, { clientId: CLIENTID, username: AUTHMETHOD, password: AUTHTOKEN });

var TOPIC = 'iot-2/evt/status/fmt/json';
console.log(TOPIC);

client.on('connect', function () {
    setInterval(function () {
        client.publish(TOPIC, '{"d":{"Volts":' + analogVolts() + ' ,"Temperature":' + getTemperature() + '}}');//Payload is JSON
    }, 100);//Keeps publishing every 100 milliseconds.
});

//Connect to an analog sensor on Edison Arduino pin A0.
//Uses mraa included with Edison image.  More info at: 
//http://iotdk.intel.com/docs/master/mraa/index.html
//Edison Arduino returns drifting values if you have no sensor; you can see
//the "data" on Bluemix if you have no sensor connected on pin A0.

//var myo = require('./myo.js');
var mraa = require('mraa'); //require mraa
//console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the console

var myOnboardLed = new mraa.Gpio(13); //LED hooked up to digital pin 13 (or built in pin on Intel Galileo Gen2 as well as Intel Edison)
myOnboardLed.dir(mraa.DIR_OUT); //set the gpio direction to output
var ledState = true; //Boolean to hold the state of Led
//Initialize PWM on Digital Pin #9 (D9) and enable the pwm pin
var enablePin = new mraa.Pwm(9);
enablePin.enable(true);
//set the period in microseconds.
enablePin.period_us(2000);//2 ms 
var value = 1.0;// 100/%
enablePin.write(value);
console.log('Finished');
periodicActivity(); 

var pin0 = new mraa.Aio(0);

var analogVolts = function () {
    var counts = pin0.read();
    var volts = counts * 4.95 / 1023;
    return parseFloat(volts).toFixed(4);
};

var getTemperature = function () {
    var a = pin0.read();
    console.log("Analog Pin (A0) Output: " + a);
    var B = 3975;
    var resistance = (1023 - a) * 10000 / a; //get the resistance of the sensor; 
    var celsius_temperature = 1 / (Math.log(resistance / 10000) / B + 1 / 298.15) - 273.15;//convert to temperature via datasheet ; 
    var fahrenheit_temperature = (celsius_temperature * (9 / 5)) + 32;
    return fahrenheit_temperature;
};

/*
myo.quickConnect(function (err, id) {
    console.log('myo unique id : ', id);
    interaction(id);
    periodicActivity();
});

function interaction(id) {

    myo.connected[id].battery(function (err, data) {
        console.log("battery : " + data + " %"); // data => battery in percent
    });

    myo.connected[id].vibrate("strong"); // light, medium, strong

    //myo.connected[id].vibrate2(1500, 255); // time in milliseconds, power 0 - 255

    //myo.connected[id].notify(); // notify :  short and light vibration

    myo.connected[id].unlock("hold", function () {
        // lock - time (will lock after inactivity) - hold
        myo.connected[id].sleepMode("forever", function () {
            // normal - forever (never sleep)
            myo.connected[id].setMode('send', 'all', 'enabled', function () {
                // emg : none - send - raw
                // imu : none - data - events - all - raw
                // classifier : enabled - disabled
                console.log('initiated');
            });
        });
    });

    //myo.connected[id].deepSleep(function () { }); // go into deep sleep

    myo.connected[id].info(function (err, data) {
        console.log(err, data);
    });

   myo.connected[id].firmware(function (err, data) {
        console.log(err, data);
   });

   myo.connected[id].generic.getName(function (err, data){ // Get device name
       console.log(err, data);
   });

   myo.connected[id].imu(true);

   myo.connected[id].classifier(true);

   myo.connected[id].emg(true);

   myo.event.on('imu', function (data) {
       console.log('imu', data);
   });
   myo.event.on('classifier', function (data) {
       console.log('classifier', data);
   });

   myo.event.on('emg4', function (data) {
       console.log('emg', data);
   });

    //   myo.connected[id].disconnect();


}*/

function periodicActivity()
{  
    if (ledState) {
        enablePin.write(1);
    }

    else {
        enablePin.write(0.5);
    }

   myOnboardLed.write(ledState?1:0); //if ledState is true then write a '1' (high) otherwise write a '0' (low)
   ledState = !ledState; //invert the ledState
   setTimeout(periodicActivity, 3000); //call the indicated function after 1 second (1000 milliseconds)
   console.log('period');
}
/*
console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the Intel XDK consol

//var myOnboardLed = new mraa.Gpio(3, false, true); //LED hooked up to digital pin (or built in pin on Galileo Gen1)
var myOnboardLed = new mraa.Gpio(13); //LED hooked up to digital pin 13 (or built in pin on Intel Galileo Gen2 as well as Intel Edison)
myOnboardLed.dir(mraa.DIR_OUT); //set the gpio direction to output
var ledState = true; //Boolean to hold the state of Led

periodicActivity(); //call the periodicActivity function
ledState = !ledState;

/*
function periodicActivity()
{
  myOnboardLed.write(ledState?1:0); //if ledState is true then write a '1' (high) otherwise write a '0' (low)
  ledState = !ledState; //invert the ledState
  setTimeout(periodicActivity,150); //call the indicated function after 1 second (1000 milliseconds)
}
*/


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
/*var ORG = '82upc0';
var TYPE = 'SFE-Edison';
var ID = '784b87aade36';
var AUTHTOKEN = 'u(aNNtxUywJI+M-b(B';*/

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

var scaling = {
    'ORIENTATION_SCALE': 16384.0,
    'ACCELEROMETER_SCALE': 2048.0,
    'GYROSCOPE_SCALE': 16.0
};

//var w_measure;
var x_measure=4.4;
var y_measure=3.6;
//var z_measure;

client.on('connect', function () {
    setInterval(function () {
      //  client.publish(TOPIC, '{"d":{"Volts":' + analogVolts() + ' ,"Temperature":' + getTemperature() + '}}');//Payload is JSON
        client.publish(TOPIC, '{"d":{"Volts":' + parseFloat(x_measure).toFixed(4) + ' ,"Temperature":' + parseFloat(y_measure).toFixed(4) + '}}');//Payload is JSON
    }, 100);//Keeps publishing every 100 milliseconds.
});

//Connect to an analog sensor on Edison Arduino pin A0.
//Uses mraa included with Edison image.  More info at: 
//http://iotdk.intel.com/docs/master/mraa/index.html
//Edison Arduino returns drifting values if you have no sensor; you can see
//the "data" on Bluemix if you have no sensor connected on pin A0.
var myo = require('./myo.js');
var mraa = require('mraa'); //require mraa
console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the console

var myOnboardLed = new mraa.Gpio(13); //LED hooked up to digital pin 13 (or built in pin on Intel Galileo Gen2 as well as Intel Edison)
myOnboardLed.dir(mraa.DIR_OUT); //set the gpio direction to output
var ledState = true; //Boolean to hold the state of Led
var poseNumber = 0;
//Initialize PWM on Digital Pin #9 (D9) and enable the pwm pin
var enablePin = new mraa.Pwm(9);
enablePin.enable(true);
//set the period in microseconds.
enablePin.period_us(20000); //20 miliseconds
var value = 0.0;// 100/%

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
var phasePin1 = new mraa.Gpio(3);
var phasePin2 = new mraa.Gpio(4);
phasePin1.dir(mraa.DIR_OUT);
phasePin2.dir(mraa.DIR_OUT);
//Initialize PWM on Digital Pin #9 (D9) and enable the pwm pin
var enablePin = new mraa.Pwm(9);
enablePin.enable(true);
//set the period in microseconds.
enablePin.period_us(2000);
var value = 1.0;// 100/%
var analogPin3 = new mraa.Aio(3); //setup access analog input Analog pin #0 (A0)
var analogValue = analogPin3.read(); //read the value of the analog pin
phasePin1.write(0);
phasePin2.write(1);
enablePin.write(value);
periodicActivity();*/
/*
myo.scan.start(function (err, data) {
    console.log(err, data);
});
myo.event.on('ready', function (id) {
    console.log('myo unique id : ', id);
    periodicActivity();
});
*/


myo.quickConnect(function (err, id) {
    console.log('myo unique id : ', id);
    //  interaction(id);

    myo.connected[id].unlock("hold", function () {
        // lock - time (will lock after inactivity) - hold
        myo.connected[id].sleepMode("forever", function () {
            // normal - forever (never sleep)
            myo.connected[id].setMode('send', 'all', 'enabled', function () {
                // emg : none - send - raw
                // imu : none - data - events - all - raw
                // classifier : enabled - disabled
                myo.connected[id].classifier(true);
                myo.connected[id].imu(true);
                myo.connected[id].emg(true);
                console.log('initiated');
            });
        });
    });

    myo.event.on('classifier', function (data) { // aca debe ir lo que quiero que se ejecute cada vez
        // console.log('classifier', data.pose);   // que un emitter accione un evento
        myOnboardLed.write(ledState ? 1 : 0); //if ledState is true then write a '1' (high) otherwise write a '0' (low)
        ledState = !ledState; //invert the ledState
        switch (data.info.pose) {
            case "rest":
                poseNumber = 1;
                value = 0.075; // between 0.05 and 0.1
                enablePin.write(value);
                break;
            case "fist":
                poseNumber = 2;
                value = 0.1;
                enablePin.write(value);
                break;
            case "wave_in":
                poseNumber = 3;
                break;
            case "wave_out":
                poseNumber = 4;
                break;
            case "fingers_spread":
                poseNumber = 5;
                value = 0.05;
                enablePin.write(value);
                break;
            case "double_tap":
                poseNumber = 6;
                break;
            case "unknow":
                poseNumber = 7;
                break;
            default:
                poseNumber = 0;
                break;
        }
        console.log('classifier', data.info.pose, poseNumber);   // que un emitter accione un evento
    });

    myo.event.on('imu', function (data) {
        //w_measure=data.readInt16LE(0) / scaling.ORIENTATION_SCALE;
         x_measure = data.metrics.orientation.x;
       // y_measure = data.metrics.accelerometer[1];//funciona
        //z_measure=data.readInt16LE(6) / scaling.ORIENTATION_SCALE;

        console.log('imu', data);
    });

    myo.event.on('emg4', function (data) { // emg3 o emg4?? mirar myo.js pero solucionado(solo con 4 me entra/funciona)
       y_measure = data.objEMG.sample1[1]; //algo esta mal aca.. no puedo acceder al dato del sensor
       // y_measure = 1.2; 

        console.log('emg', data);
    });

   // interaction(id); // en interaction deben ir lo que se repite
    /*
        myo.connected[id].info(function (err, data) {
            // console.log(err, data);
            periodicActivity(data);
            //console.log("pose", data.unlock_pose); // funciona
        });
        myo.connected[id].info(function (err, data) {
            // console.log(err, data);
            periodicActivity(data);
            //console.log("pose", data.unlock_pose); // funciona
        });
  */
});

function interaction(id) { // interaction es un bucle por lo que aqui debo poner los emitters

    myo.connected[id].battery(function (err, data) {
       // console.log("battery : " + data + " %"); // data => battery in percent
    });
    /*
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
                myo.connected[id].imu(true);

                myo.connected[id].emg(true);

                myo.connected[id].classifier(true);
                console.log('initiated');
            });
        });
    });

   */

    //myo.connected[id].deepSleep(function () { }); // go into deep sleep

   myo.connected[id].info(function (err, data) {
      //  console.log(err, data);
      // console.log("unlock_pose", data.unlock_pose); // funciona
    });


   //myo.event.emit('classifier', ledState);

    /*
   myo.connected[id].firmware(function (err, data) {
       //console.log(err, data);
   });
    
   myo.connected[id].generic.getName(function (err, data){ // Get device name
       //console.log(err, data);
   });
   
 


   myo.event.on('classifier', function (data) {
       console.log('classifier', data);
   });
  */

    
/*
    myo.event.on('imu', function (data) {
       console.log('imu', data);
   });

    myo.event.on('emg4', function (data) {
       console.log('emg', data);
   });*/
   

    //   myo.connected[id].disconnect();


    setTimeout(function () {
        interaction(id);
    }, 500);
}

function periodicActivity(data)
{  
    /*
    analogValue = analogPin3.read();
    console.log(analogValue); //write the value of the analog pin to the console
    if (analogValue < 170) {
        phasePin1.write(0);
        phasePin2.write(1);
        enablePin.write(value);
    }

    if (analogValue > 950) {
        phasePin1.write(1);
        phasePin2.write(0);
        enablePin.write(value);
    } 

    myo.connected[id].info(function (err, data) {
       // console.log(err, data);
        console.log("pose", data.unlock_pose); // funciona
    });
    
    myo.event.on('classifier', function (data) {
        console.log('classifier', data.pose);
    });*/

   
    myOnboardLed.write(ledState?1:0); //if ledState is true then write a '1' (high) otherwise write a '0' (low)
    ledState = !ledState; //invert the ledState
    console.log('hello world!');
    console.log("pose", data.unlock_pose); // funciona
    console.log('hello world!');
    setTimeout(periodicActivity[data],3000); //call the indicated function after 1 second (1000 milliseconds)

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


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


var scaling = {
    'ORIENTATION_SCALE': 16384.0,
    'ACCELEROMETER_SCALE': 2048.0,
    'GYROSCOPE_SCALE': 16.0
};

var w_orientation=0;
var x_orientation=0;
var y_orientation=0;
var z_orientation=0;

var x_accelerometer=0;
var y_accelerometer=0;
var z_accelerometer=0;

var x_gyroscope=0;
var y_gyroscope=0;
var z_gyroscope=0;

var pod = [0, 0, 0, 0, 0, 0, 0, 0];

var pose = "null";
var arm = "null";
var x_direction = "null";
var type_event = "null";


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
var phasePin1 = new mraa.Gpio(3);
var phasePin2 = new mraa.Gpio(4);
phasePin1.dir(mraa.DIR_OUT);
phasePin2.dir(mraa.DIR_OUT);
var poseNumber = 0;
//Initialize PWM on Digital Pin #9 (D9) and enable the pwm pin
var enablePin = new mraa.Pwm(9);
enablePin.enable(true);
//set the period in microseconds.
enablePin.period_us(50); //2 miliseconds
var value = 0.0;// 100/%
var analogPin3 = new mraa.Aio(3); //setup access analog input Analog pin #0 (A0)
var analogValue = analogPin3.read(); //read the value of the analog pin
//enablePin.write(value);
phasePin1.write(0);// FORWARD 
phasePin2.write(1);

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
        pose = data.info.pose;
        arm = data.info.arm;
        x_direction = data.info.x_direction;
        type_event = data.info.type_event;
        switch (data.info.pose) {
            case "rest":
                poseNumber = 1;
                value = 0.0; // between 0.0 and 1.0
                enablePin.write(value);
                break;
            case "fist":
                poseNumber = 2;
                analogValue = analogPin3.read();
                phasePin1.write(1);
                phasePin2.write(0);
                value = 0.7;
                if (analogValue <= 10) { // 0 + 10
                value=0.0;
                }
                enablePin.write(value);
                myo.connected[id].vibrate("light");
                break;
            case "wave_in":
                poseNumber = 3;
                break;
            case "wave_out":
                poseNumber = 4;
                break;
            case "fingers_spread":
                poseNumber = 5;
                analogValue = analogPin3.read();
                phasePin1.write(0);
                phasePin2.write(1);
                value = 0.7;
                if (analogValue >= 4085) { //4095 - 10
                    value=0.0;
                }
                enablePin.write(value);
                myo.connected[id].vibrate("strong"); // light, medium, strong
                console.log('myo unique id : ', id);
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
     
        x_orientation = data.metrics.orientation.x;
        y_orientation = data.metrics.orientation.y;
        z_orientation = data.metrics.orientation.z;
        w_orientation = data.metrics.orientation.w;

        x_accelerometer = data.metrics.accelerometer[0];//funciona
        y_accelerometer = data.metrics.accelerometer[1];
        z_accelerometer = data.metrics.accelerometer[2];

        x_gyroscope = data.metrics.gyroscope[0];
        y_gyroscope = data.metrics.gyroscope[1];
        z_gyroscope = data.metrics.gyroscope[2];

        console.log('imu', data);
    });

    myo.event.on('emg4', function (data) { // emg3 o emg4?? mirar myo.js pero solucionado(solo con 4 me entra/funciona)
        pod[0] = data.objEMG.sample1[0]; //funciona
        pod[1] = data.objEMG.sample1[1];
        pod[2] = data.objEMG.sample1[2];
        pod[3] = data.objEMG.sample1[3];
        pod[4] = data.objEMG.sample1[4];
        pod[5] = data.objEMG.sample1[5];
        pod[6] = data.objEMG.sample1[6];
        pod[7] = data.objEMG.sample1[7];
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

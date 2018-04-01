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
//var myo = require('./myo.js');
var mraa = require('mraa'); //require mraa
console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the console

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


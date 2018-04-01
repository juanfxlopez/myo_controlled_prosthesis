

console.log("Hola amor mio. Eres lo mas lindo que me ha pasado");

var events = require('events');
var myEmitter = new events.EventEmitter();

var myo = {};
myo.event= myEmitter;

var a = 1000;
var k = 1.89;
myo.event.on('evento1', () => {
    k=k*199.99-0.14;
    console.log('an event occurred!',this,k);
});

    myo.event.on('evento2', function (a, b) { //en el .on escribo lo que quiero que hagan cuando entren
        b=b+1;
        k=k+2;
    console.log(a, b, this);
    // Prints:
    //   a b MyEmitter {
    //     domain: null,
    //     _events: { event: [Function] },
    //     _eventsCount: 1,
    //     _maxListeners: undefined }
});

myo.event.on('evento3', (a, b) => {
    console.log(a, b, this);
// Prints: a b {}
});

myEmitter.emit('evento1');    // el emitter es el que hace que entre.. cuando hay uno lo manda al evento
myEmitter.emit('evento2', a, k);// lo importante son los datos que le entren y cuando se llama al evento
myEmitter.emit('evento2', a, k);
myEmitter.emit('evento3', a, k);
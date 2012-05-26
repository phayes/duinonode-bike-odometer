// Libaries
var arduino = require('duino');
var _       = require('underscore');

// Parameters 
// Wheel circumference in cm
var whell_circ = 210;

// Arduino Objects
var board;
var sensors = [];

// Variables
var prev_state = false;
var state = false;
var false_count = 0;
var rotations = 0;

// Connect to the arduino board
board = new arduino.Board({
  debug: false
});

// Boot up sensor A0
sensor = new arduino.Sensor({
  board: board,
  pin: 'A0'
});

// Let's read from Sensor A0
sensor.on('read', function(err, value) {
  // Save the previous state so we know when we've switched
  prev_state = state;
  
  // We are sending 5 volts to the wheel, calculate how much we are getting back
  var voltage = (5/1023) * value;
    
  // If we have over 4.8 volts or under 0.2 volts, we are electrifying the wheel; mark the signal as 'on'
  var signal = (voltage > 4.8 || voltage < 0.2);
  
  // We rarely have false-positives, so if the signal is on, mark the state as on and reset the false-count
  if (signal) {
    state = true;
    false_count = 0;
  }
  // We often have false-negatives, look in the history.
  // The state is only false if there are three in a row falses 
  else {
    false_count++;
    
    if (false_count > 3) {
      state = false; 
    }
  }
    
  // Log a rotation if state goes from off to on
  if (!prev_state && state) {
    rotations++;
    console.log("You've travelled " + (rotations*whell_circ/100) + ' meters!');
  }
  
});

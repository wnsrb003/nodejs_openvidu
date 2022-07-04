// Mimic Me!
// Fun game where you need to express emojis being displayed

// --- Affectiva setup ---
// The affdex SDK Needs to create video and canvas elements in the DOM
// var divRoot = $("#local-video-undefined")[0];  // div node where we want to add these elements
// var width = 320, height = 240;  // camera image size
// var faceMode = affdex.FaceDetectorMode.LARGE_FACES;  // face mode parameter
// Initialize an Affectiva CameraDetector object
// var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);

// Enable detection of all Expressions, Emotions and Emojis classifiers.
// detector.detectAllEmotions();
// detector.detectAllExpressions();
// detector.detectAllEmojis();
// detector.detectAllAppearance();

// --- Utility values and functions ---

// Unicode values for all emojis Affectiva can detect
// var emojis = [ 128528, 9786, 128515, 128524, 128527, 128521, 128535, 128539, 128540, 128542, 128545, 128563, 128561 ];


// Update target emoji being displayed by supplying a unicode value
function setTargetEmoji(code) {
  $("#target").html("&#" + code + ";");
}

// Convert a special character to its unicode value (can be 1 or 2 units long)
function toUnicode(c) {
  if(c.length == 1)
    return c.charCodeAt(0);
  return ((((c.charCodeAt(0) - 0xD800) * 0x400) + (c.charCodeAt(1) - 0xDC00) + 0x10000));
}

// Update score being displayed
function setScore(correct, total) {
  $("#score").html("Score: " + correct + " / " + total);
}

// Display log messages and tracking results
function log(node_name, msg) {
  $(node_name).append("<span>" + msg + "</span><br />")
}

// --- Callback functions ---

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/weights"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/weights"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/weights"),
  faceapi.nets.faceExpressionNet.loadFromUri("/weights"),
]).then(console.log('load end'));
// const video = document.getElementById("video");

let canvas = '';
// Start button
async function onStart() {
  var input = document.getElementById('local-video-undefined')
  console.log(`Start!!! : ${input}`)

  // const canvas = faceapi.createCanvasFromMedia(input);
  // const displaySize = { width: 480, height: 320 };
  // faceapi.matchDimensions(canvas, displaySize);
  var f = setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(input, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    // const resizedDetections = faceapi.resizeResults(detections, displaySize);
    // canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    // console.log(detections[0].expressions)
    canvas = detections[0].expressions || '';
    res = ''
    if (canvas){
      var keys = Object.keys(canvas)
      var max = canvas[keys[0]]
      for (i=0; i<keys.length; i++){
        value = canvas[keys[i]]
        if (value > max) res = keys[i]
      }
      if (res == 'happy'){
        document.getElementById('textl').textContent = '웃으셨네요!'
        clearInterval(f)
      }
    }
  }, 100)
}

// Stop button
function onStop() {
  log('#logs', "Stop button pressed");
  if (detector && detector.isRunning) {
    detector.removeEventListener();
    detector.stop();  // stop detector
  }
  initializeGame(updateTarget = false)
};

// Reset button
function onReset() {
  document.getElementById('textl').textContent = '다시!'
  onStart()
  // log('#logs', "Reset button pressed");
  // if (detector && detector.isRunning) {
  //   detector.reset();
  // }
  // $('#results').html("");  // clear out results
  // $("#logs").html("");  // clear out previous log

  // initializeGame(updateTarget = false)
};

// Add a callback to notify when camera access is allowed
// detector.addEventListener("onWebcamConnectSuccess", function() {
//   log('#logs', "Webcam access allowed");
// });

// Add a callback to notify when camera access is denied
// detector.addEventListener("onWebcamConnectFailure", function() {
//   log('#logs', "webcam denied");
//   console.log("Webcam access denied");
// });

// // Add a callback to notify when detector is stopped
// detector.addEventListener("onStopSuccess", function() {
//   log('#logs', "The detector reports stopped");
//   $("#results").html("");
// });

// // Add a callback to notify when the detector is initialized and ready for running
// detector.addEventListener("onInitializeSuccess", function() {
//   log('#logs', "The detector reports initialized");
//   //Display canvas instead of video feed because we want to draw the feature points on it
//   $("#face_video_canvas").css("display", "block");
//   $("#face_video").css("display", "none");

//   // TODO(optional): Call a function to initialize the game, if needed
//   // <your code here>
//   initializeGame(updateTarget = true)
// });

// // Add a callback to receive the results from processing an image
// // NOTE: The faces object contains a list of the faces detected in the image,
// //   probabilities for different expressions, emotions and appearance metrics
// detector.addEventListener("onImageResultsSuccess", function(faces, image, timestamp) {
//   var canvas = $('#face_video_canvas')[0];
//   if (!canvas)
//     return;

//   // Report how many faces were found
//   $('#results').html("");
//   log('#results', "Timestamp: " + timestamp.toFixed(2));
//   log('#results', "Number of faces found: " + faces.length);
//   if (faces.length > 0) {
//     // Report desired metrics
//     log('#results', "Appearance: " + JSON.stringify(faces[0].appearance));
//     log('#results', "Emotions: " + JSON.stringify(faces[0].emotions, function(key, val) {
//       return val.toFixed ? Number(val.toFixed(0)) : val;
//     }));
//     log('#results', "Expressions: " + JSON.stringify(faces[0].expressions, function(key, val) {
//       return val.toFixed ? Number(val.toFixed(0)) : val;
//     }));
//     log('#results', "Emoji: " + faces[0].emojis.dominantEmoji);

//     // Call functions to draw feature points and dominant emoji (for the first face only)
//     drawFeaturePoints(canvas, image, faces[0]);
//     drawEmoji(canvas, image, faces[0]);
//   }
// });


// // --- Custom functions ---

// // Draw the detected facial feature points on the image
// function drawFeaturePoints(canvas, img, face) {
//   // Obtain a 2D context object to draw on the canvas
//   var ctx = canvas.getContext('2d');

//   ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
//   ctx.strokeStyle =  'white';

//   // Loop over each feature point in the face
//   for (var id in face.featurePoints) {
//     var featurePoint = face.featurePoints[id];
//     ctx.beginPath();
//     ctx.arc(featurePoint.x, featurePoint.y, 3, 0 , 2 * Math.PI, true)
//     ctx.stroke();
//   }
// }

// // Draw the dominant emoji on the image
// function drawEmoji(canvas, img, face) {
//   // Obtain a 2D context object to draw on the canvas
//   var ctx = canvas.getContext('2d');

//   ctx.font = '48px serif';
//   var maxX = 0, minY = 1000;
//   for (var id in face.featurePoints) {
//     var featurePoint = face.featurePoints[id];

//     if (featurePoint.x > maxX)
//       maxX = featurePoint.x
//     if (featurePoint.y < minY)
//       minY = featurePoint.y
//   }

//   ctx.fillStyle = 'yellow'
//   ctx.fillText(face.emojis.dominantEmoji, maxX, minY)
//   checkEmoji(toUnicode(face.emojis.dominantEmoji))

//   // Updates the TargetEmoji if expression not made in 200 frames
//   timer = timer + 1
//   if (timer > 200)
//     updateTargetEmoji()
// }

// // Initializes the Game
// function initializeGame(updateTarget) {
//   currentEmoji = 0;
//   correct = 0;
//   total = 0;
//   setScore(0,0)
//   setTargetEmoji(toUnicode('?'))
//   if (updateTarget)
//     updateTargetEmoji();
// }

// // Updates the Target Emoji
// function updateTargetEmoji(){
//   currentEmoji = emojis[Math.floor(Math.random() * (emojis.length))]
//   setTargetEmoji(currentEmoji)
//   total = total + 1;
//   timer = 0;
//   setScore(correct,total)
// }

// // Checks if the face emoji matches the target emojis
// function checkEmoji(dominantEmoji) {
//   if (currentEmoji == dominantEmoji) {
//     correct = correct + 1
//     setScore(correct,total)
//     updateTargetEmoji()
//   }
// }

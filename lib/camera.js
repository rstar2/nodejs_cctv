const cv = require("opencv4nodejs");

const history = require("./history");

// const rows = 100; // height
// const cols = 100; // width

const devicePort = 0;

const fps = 24;
let broadcastInterval;

let videoCapture;

/**
 *
 * @param {(buffer: Buffer) => void} onCapture
 */
exports.start = function (onCapture) {
  console.log("Start webcam");
  history.start();

  // just a  protection
  if (videoCapture) return console.error("Already started webcam");

  // open capture from webcam
  videoCapture = new cv.VideoCapture(devicePort);

  // start broadcasting frames with desired FSP rate
  broadcastInterval = setInterval(() => {
    onCapture(capture());
  }, 1000 / fps);
};

exports.stop = function () {
  // just a  protection
  if (!videoCapture) return console.error("Already stopped webcam");

  console.log("Stop camera");

  videoCapture.release();
  videoCapture = undefined;

  clearInterval(broadcastInterval);
  broadcastInterval = null;

  history.stop();
};

/**
 * Capture a snapshot image from camera
 * @return {Buffer} always valid
 */
function capture() {
  // a protection in videoCapture has been released already. should not happen though
  if (!videoCapture) return;

  // read a single frame
  const frame = videoCapture.read();
  const image = cv.imencode(".jpg", frame);

  // give to the history but after it's been returned
  const now = new Date();
  process.nextTick(() => history.process(image, now));

  return image;
}

const Camera = require("./camera").Camera;
const cv = require("opencv4nodejs");
// const cv = require("opencv4nodejs-prebuilt");

// const rows = 100; // height
// const cols = 100; // width

const devicePort = 0;

class CameraOpenCV extends Camera {
  // Node 14 still don't support public/private field declarations
  // #_videoCapture;

  _startImpl() {
    // just a  protection
    if (this._videoCapture) return console.error("Already started webcam");

    // open capture from webcam
    this._videoCapture = new cv.VideoCapture(devicePort);
  }

  _stopImpl() {
    // just a  protection
    if (!this._videoCapture) return console.error("Already stopped webcam");

    this._videoCapture.release();
    this._videoCapture = undefined;
  }

  _captureImpl() {
    // a protection in videoCapture has been released already. should not happen though
    if (!this._videoCapture) return;

    // read a single frame
    const frame = this._videoCapture.read();
    const image = cv.imencode(".jpg", frame);
    return image;
  }
}

module.exports = CameraOpenCV;

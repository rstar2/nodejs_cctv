const history = require("./history");

const fps = 24;
const broadcastPeriod = 1000 / fps;
class Camera {
  // Node 14 still don't support public/private field declarations
  // #_broadcastInterval;

  /**
   *
   * @param {(buffer: Buffer) => void} onCapture
   */
  start(onCapture) {
    console.log("Start webcam");
    history.start();

    this._startImpl();

    // start broadcasting frames with desired FSP rate
    // NOTE: Not the best solution for "period" as thus the real FPS is not correct,
    //       it depends on the this._capture() promise,
    //       but it's enough for simple "live" streaming
    const capture = async () => {
      try {
        const image = await this._capture();
        onCapture(image);

        // as this a Promise (because of async/await) then even if
        // clearTimeout(this._broadcastInterval) is called this promise will resolve/reject
        if (this._broadcastInterval) this._broadcastInterval = setTimeout(capture, broadcastPeriod);
      } catch (err) {
        console.error("Failed capturing image", err.message);
      }
    };
    this._broadcastInterval = setTimeout(capture, broadcastPeriod);
  }

  stop() {
    console.log("Stop camera");

    this._stopImpl();

    clearTimeout(this._broadcastInterval);
    this._broadcastInterval = undefined;

    history.stop();
  }

  /**
   * Capture a snapshot image from camera
   * @return {Promise<Buffer>} always valid
   */
  async _capture() {
    const image = await this._captureImpl();
    // give to the history but after it's been returned
    const now = new Date();
    process.nextTick(() => history.process(image, now));

    return image;
  }

  async _captureImpl() {
    // implement
    throw new Error("Implement abstract method _captureImpl()");
  }
  _startImpl() {
    // implement
    throw new Error("Implement abstract method _startImpl()");
  }
  _stopImpl() {
    // implement
    throw new Error("Implement abstract method _stopImpl()");
  }
}

/**
 * Factory
 * @param {string} impl
 * @return {Camera}
 */
function factoryCamera(impl) {
  let camera;
  switch (impl) {
    case factoryCamera.OPENCV:
      // eslint-disable-next-line no-case-declarations
      const CameraOpenCV = require("./camera-opencv");
      camera = new CameraOpenCV();
      break;
    case factoryCamera.FSWEBCAM:
      // eslint-disable-next-line no-case-declarations
      const CameraFsWbcam = require("./camera-fswebcam");
      camera = new CameraFsWbcam();
      break;
    default:
      throw new Error(`Invalid camera implementation ${impl}`);
  }
  return camera;
}

factoryCamera.OPENCV = "opencv";
factoryCamera.FSWEBCAM = "fswebcam";
factoryCamera.Camera = Camera;

module.exports = factoryCamera;

const cv = require("opencv4nodejs");
// const rows = 100; // height
// const cols = 100; // width

let sockets = 0;
let livecamSockets = 0;

const devicePort = 0;
const fps = 24;

let wCap;
let broadcastInterval;

/**
 *
 * @param {SocketIO.Socket} socket
 */
function setupSocket(socket) {
  console.log("Connected socket", socket.id);

  sockets++;
  socket.send("ready");

  socket.on("disconnecting", (reason) => {
    // if socket was in the 'live' room
    if ("live" in socket.rooms) {
      console.log('Disconnecting "live" socket', socket.id, reason);

      livecamSockets--;
      checkStop();
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected socket", socket.id);
    sockets--;
  });

  socket.on("message", (data) => {
    // for now this is the only possible message data
    switch (data) {
      case "start":
        console.log('Socket is "live" now', socket.id);
        livecamSockets++;
        socket.join("live");
        checkStart(socket.server);
        break;
      case "stop":
        console.log('Socket is not "live" anymore', socket.id);
        livecamSockets--;
        socket.leave("live");
        checkStop();
        break;
      default:
        console.error("Invalid message data", data);
    }
  });
}

function checkStop() {
  // if no more client sockets listening then stop/release the webcam device
  if (livecamSockets !== 0) return;

  console.log("Stop webcam");

  // just a  protection
  if (!wCap) return console.error("Already stopped webcam");

  wCap.release();
  wCap = null;
  if (broadcastInterval) {
    clearInterval(broadcastInterval);
    broadcastInterval = null;
  }
}

/**
 *
 * @param {SocketIO.Server} io
 */
function checkStart(io) {
  // on the first connected and waiting socket start emitting the webcam
  if (livecamSockets !== 1) return;

  console.log("Start webcam");

  // open capture from webcam
  wCap = new cv.VideoCapture(devicePort);

  // start broadcasting frames with desired FSP rate
  broadcastInterval = setInterval(() => {
    broadcastLivecam(io);
  }, 1000 / fps);
}

/**
 * @param {SocketIO.Server} io
 */
function broadcastLivecam(io) {
  // a protection in wCap has been released already. should not happen though
  if (!wCap) return;

  // read a single frame
  const frame = wCap.read();
  const /* Buffer */ image = cv.imencode(".jpg", frame);
  // send the image data that will be received as ArrayBuffer in the Browser
  // or send the image as already encoded to Base64 string "image.toString('base64')"
  io.to("live").emit("image", image);
}

/**
 *
 * @param {import("http").Server} server
 * @param {import("express").Express} app
 */
exports.setup = function (server, app) {
  // setup Express endpoints
  app.get("/live", (req, res) => res.redirect("/live.html"));

  // setup socket.io on the 'io/livecam' path,
  // so create a SocketIO.Server
  const ioLiveCam = require("socket.io")(server, {
    path: "/io/livecam",
  });

  ioLiveCam.on("connect", setupSocket);
};

exports.getStatistics = function () {
  return {
    sockets,
    livecamSockets,
  };
};

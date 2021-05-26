/**
 * @type {import("./camera").Camera}
 */
let camera;

/**
 * @type {number}
 */
let sockets = 0;

/**
 * @type {number}
 */
let livecamSockets = 0;

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

  camera.stop();
}

/**
 *
 * @param {SocketIO.Server} io
 */
function checkStart(io) {
  // on the first connected and waiting socket start emitting the webcam
  if (livecamSockets !== 1) return;

  camera.start((image) => {
    // send the image data that will be received as ArrayBuffer in the Browser
    // or send the image as already encoded to Base64 string "image.toString('base64')"
    io.to("live").emit("image", image);
  });
}

/**
 *
 * @param {import("./camera").Camera} cam
 * @param {import("express").Express} app
 * @param {import("http").Server} server
 */
exports.setup = function (cam, app, server) {
  camera = cam;
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

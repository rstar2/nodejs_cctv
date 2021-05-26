const { createCanvas } = require("canvas");
const { v4: uuidv4 } = require("uuid");

const BOUNDARY = "daboundary";

/**
 * @type {import("./camera").Camera}
 */
let camera;

const clients = new Map();

/**
 *
 * @param {import("./camera").Camera} cam
 * @param {import("express").Express} app
 */
exports.setup = function (cam, app) {
  camera = cam;

  // setup Express endpoints
  app.get("/live2", (req, res) => res.redirect("/live2.html"));

  // TODO: implement
  // app.get("/snapshot", (req, res) => {
  //   const buffer = generateImage(0);
  //   res.header("Content-Type", "image/png");
  //   res.send(buffer);
  // });
  app.get("/stream", (req, res) => {
    // req.on("close", () => {
    //   console.error("Request closed ", req, res);
    // });
    // req.on("aborted", () => {
    //   console.error("Request aborted ", req, res);
    // });
    // req.on("error", () => {
    //   console.error("Request error ", req, res);
    // });

    res.on("close", () => {
      console.error("Response closed ", req, res);
      onClientDisconnected(clientUid);
    });

    res.header("Content-Type", `multipart/x-mixed-replace; boundary=${BOUNDARY}`);

    const clientUid = onClientConnected(res);
  });
};

/**
 * New client is connected
 * @param {import("express").Response} res
 * @return {number}
 */
function onClientConnected(res) {
  const clientUid = uuidv4();
  clients.set(clientUid, res);

  // if first client the start the live transmission
  if (clients.size === 1) {
    startBroadcasting();
  }

  return clientUid;
}

/**
 * Client is disconnected
 * @param {number} clientUid
 */
function onClientDisconnected(clientUid) {
  clients.delete(clientUid);

  // if no more clients then stop the live transmission
  if (clients.size === 0) {
    stopBroadcasting();
  }
}

function startBroadcasting() {
  console.log("Start broadcasting");

  camera.start((image) => {
    const length = image.length;

    // broadcast to all clients
    clients.forEach((res, uid) => {
      // console.log("Send to", uid);
      broadcast(image, length, res);
    });
  });
}

function stopBroadcasting() {
  console.log("Stop broadcasting");
  camera.stop();
}

/**
 *
 * @param {Buffer} data
 * @param {number} length
 * @param {import("express").Response} res
 */
function broadcast(data, length, res) {
  res.write(`--${BOUNDARY}\nContent-Type: image/png\nContent-length: ${length}\n\n`);
  res.write(data);
  res.write("\n\n");
}

// /**
//  * Get a
//  * @param {number} num
//  * @return {Buffer}
//  */
// function generateImage(num) {
//   const canvas = createCanvas(100, 30);
//   const ctx = canvas.getContext("2d");

//   // Background
//   ctx.fillStyle = "rgba(100, 149, 237, 0)";
//   ctx.fillRect(0, 0, 200, 30);

//   // Text
//   ctx.fillStyle = "rgb(0, 100, 0)";
//   ctx.font = "20px";
//   ctx.fillText("Users: " + num, 10, 20);

//   return canvas.toBuffer();
// }

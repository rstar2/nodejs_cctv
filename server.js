const path = require("path");
const http = require("http");
const express = require("express");

const createCamera = require("./lib/camera");
// const camera = createCamera(createCamera.OPENCV);
const camera = createCamera(createCamera.FSWEBCAM);

const livecamSocketIO = require("./lib/livecam-socketio");
const livecamMultipart = require("./lib/livecam-multipart");

process.addListener("unhandledRejection", (reason /*, promise */) => {
  console.error("Global Unhandled promise rejection", reason);
  process.exit(1);
});

// create Express server
// and normal HTTP server out of it as it will be used for a SocketIO server
const app = express();
const server = http.createServer(app);

// configure the static resources endpoints
app.use(express.static(path.resolve(__dirname, "public")));

// configure common endpoint
app.get("/history", (req, res) => res.redirect("/history.html"));

// configure multiple implementations of "livecam streaming"
livecamSocketIO.setup(camera, app, server);
livecamMultipart.setup(camera, app);

// finally/lastly attach global Express server error handler
app.use((err, req, res, next) => {
  //call handler here
  console.error("Global error", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500);
  if (req.xhr) res.send({ error: err });
  else res.render("error", { error: err });
});

// start the server - both Express and SocketIO
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

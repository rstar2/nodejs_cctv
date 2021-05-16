const { createCanvas } = require("canvas");

const BOUNDARY = "daboundary";

/**
 *
 * @param {import("express").Express} app
 */
exports.setupEndpoints = function (app) {
  // setup Express endpoints
  app.get("/live2", (req, res) => res.redirect("/live2.html"));

  app.get("/snapshot", (req, res) => {
    const buffer = generateImage(0);
    res.header("Content-Type", "image/png");
    res.send(buffer);
  });
  app.get("/stream", (req, res) => {
    req.on("close", () => {
      console.error("Request closed ", req, res);
    });
    req.on("aborted", () => {
      console.error("Request aborted ", req, res);
    });
    req.on("error", () => {
      console.error("Request error ", req, res);
    });

    res.on("close", () => {
      console.error("Response closed ", req, res);
    });
    res.on("aborted", () => {
      console.error("Response aborted ", req, res);
    });
    res.on("error", () => {
      console.error("Response error ", req, res);
    });

    res.header("Content-Type", `multipart/x-mixed-replace; boundary=${BOUNDARY}`);

    let num = 0;
    const interval = setInterval(() => {
      num++;
      if (num === 5) {
        clearInterval(interval);
        res.end();
      } else {
        const buffer = generateImage(num);
        res.write(`--${BOUNDARY}\nContent-Type: image/png\nContent-length: ${buffer.length}\n\n`);
        res.write(buffer);
        res.write("\n\n");
      }
    }, 1000);
  });
};

/**
 * Get a
 * @param {number} num
 * @return {Buffer}
 */
function generateImage(num) {
  const canvas = createCanvas(100, 30);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "rgba(100, 149, 237, 0)";
  ctx.fillRect(0, 0, 200, 30);

  // Text
  ctx.fillStyle = "rgb(0, 100, 0)";
  ctx.font = "20px";
  ctx.fillText("Users: " + num, 10, 20);

  return canvas.toBuffer();
}

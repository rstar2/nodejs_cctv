const child_process = require("child_process");

const Camera = require("./camera").Camera;

class CameraOpenCV extends Camera {
  // Node 14 still don't support public/private field declarations
  // #_toExec;

  _startImpl() {}

  _stopImpl() {
    // TODO: Could add code for killing the spawned process (or also if used exec)
    //       using an AbortSignal in Node15+
    //       but there's no need it's not a long-lived process anyway
  }

  _captureImpl() {
    return new Promise((resolve, reject) => {
      // NOTE: pass encoding to be "buffer"|null as then stdout will be Buffer instance,
      //       otherwise it will be a utf-8 encoded string
      child_process.exec("fswebcam -", { encoding: "buffer" }, (error, stdout, stderr) => {
        if (error) return reject(error);

        if (stdout) return resolve(stdout);

        reject(new Error("No data"));
      });

      // let /* Buffer */ buffer;
      // const child = child_process.spawn("fswebcam", ["-"]);
      // child.stdout.on("data", function (data) {
      //   if (!buffer) buffer = data;
      //   else buffer = Buffer.concat([buffer, data]);
      // });

      // // child.stderr.on("data", function (data) {
      // //   console.log("stderr: " + data);
      // // });

      // child.once("close", function (code) {
      //   if (code !== 0) reject(new Error(`Process failed with code ${code}`));
      //   else if (!buffer) reject(new Error("No data"));
      //   else resolve(buffer);
      // });
    });
  }
}

module.exports = CameraOpenCV;

const child_process = require("child_process");

// child_process.exec("fswebcam -", (error, stdout, stderr) => {
//   if (error) process.exit(1);

//   if (stdout) console.log("Data,", stdout);
// });

const child = child_process.spawn("fswebcam", ["-"]);
child.stdout.on("data", function (data) {
  console.log("stdout: " + data);
});

child.stderr.on("data", function (data) {
  console.log("stderr: " + data);
});

// "close" will be called after "exit" or "error" events
child.on("close", function (code) {
  console.log("child process exited with code " + code);
});

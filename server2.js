const { Readable } = require("stream");
const http = require("http");

const boundary = "gc0p4Jq0M2Yt08jU534c0p";

//Must be implemented in the way of flow
//Otherwise, res will be closed in advance
//For the implementation of readable stream, please refer to: https://nodejs.org/api/stream.html ා stream ා implementing ﹣ a ﹣ readable ﹣ stream
class MockStream extends Readable {
  constructor(...arg) {
    super(...arg);
    this.count = 0;
  }
  async _read() {
    const buffer = Buffer.concat([
      new Buffer(`--${boundary}\r\n`),
      new Buffer("Content-Type: text/html\r\n\r\n"),
      new Buffer(`<html><body>${this.count}</body></html>\r\n\r\n`)
    ]);
    this.count++;
    setTimeout(() => {
      this.push(buffer);

      if (this.count === 5)
        this.emit("end");
    }, 1000);
  }
}

http
  .createServer((req, res) => {
    //First output response header
    res.writeHead(200, {
      "Content-Type": `multipart/x-mixed-replace; boundary="${boundary}"`
    });
    const stream = new MockStream();
    stream.pipe(res);
  })
  .listen(3000);
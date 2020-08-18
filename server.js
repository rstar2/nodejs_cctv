const path = require('path');
const express = require('express');

const livecam = require('./livecam');

const app = express();

app.get('/', (req, res) => res.redirect('/index.html'));
app.use(express.static(path.resolve(__dirname, 'public')));

const server = require('http').createServer(app);

// setup socket.io on the 'io/livecam' path
const ioLiveCam = require('socket.io')(server, {
  path: '/io/livecam',
});

livecam.init(ioLiveCam);

// attach global error handler
app.use((err, req, res, next) => {
  //call handler here
  console.error('Global error', err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500);
  if (req.xhr) res.send({ error: err });
  else res.render('error', { error: err });
});
process.addListener('unhandledRejection', (reason, promise) => {
  console.error('Global Unhandled promise rejection', reason);
  process.exit(1);
});

// start the server - both Express and SocketIO
server.listen(3000);

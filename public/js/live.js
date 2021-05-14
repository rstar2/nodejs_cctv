/* global io:true */

const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

let livecamImg, startButton, stopButton;

// connect a client socket on this socket.io server
const socket = io('http://localhost:3000', {
  path: '/io/livecam',
});

socket.on('message', (data) => {
  //   console.log(data);

  // for now this is the only possible message data;
  if (data === 'ready') {
    // show UI
    livecamImg = document.createElement('img');
    document.body.appendChild(livecamImg);

    // send response to server, that it's in 'waiting' state
    socket.send('start');
  }
});

// handle the event sent with socket.emit('image', image)
socket.on('image', (image) => {
  // convert image file to base64 string
  livecamEl.src = `data:image/png;base64, ${arrayBufferToBase64(image)}`;
});

## Used Technologies

1. opencv4nodejs for webcam stream capture
2. Single HTTP server with:
  2.1. Express.js as server for client UI and
  2.2. Server Socket.io to broadcast to connected clients
3. Client Socket.io to show incoming image data in a IMG element (with 'data:image/png;base64')

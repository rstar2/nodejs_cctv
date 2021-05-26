# Used Technologies

1. Capture webcam
1.1. opencv4nodejs for webcam stream capture (can use also opencv4nodejs-prebuilt but only works for x64)
1.2. Try the fswebcam CLI program (```sudo apt install fswebcam```)


2. Express HTTP server with:
  2.1. Server Socket.io to broadcast to connected clients and 
  Client Socket.io to show incoming image data in a IMG element (with 'data:image/png;base64')
  2.2. Simple "multipart/x-mixed-replace" request-response and in client just a simple image tag <img src="/stream">

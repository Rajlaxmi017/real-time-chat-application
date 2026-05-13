const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
app.use(cors());

const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*", // Allow React app to connect
    methods: ["GET", "POST"],
  },
});


const users = {};

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("join", (username) => {
    users[socket.id] = username;
    socket.broadcast.emit("user_joined", username);
  });

  socket.on("send_message", (message) => {
    io.emit("receive_message", {
      text: message,
      sender: users[socket.id],
    });
  });

  socket.on("typing", () => {
    socket.broadcast.emit("user_typing", users[socket.id]);
  });
  
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete users[socket.id];
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

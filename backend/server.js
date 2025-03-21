// imports required for server
import { uniqueNamesGenerator, colors, names } from "unique-names-generator";
import express from "express";
import http from "http";

// import the socket.io library
import { Server } from "socket.io";

// initializing the servers: HTTP as well as Web Socket
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://your-netlify-app.netlify.app", "http://localhost:3000"], // Add your Netlify URL
    methods: ["GET", "POST"]
  }
});
// create the chat history array for storing messages
const chatHistory = [];

// listen for new web socket connections
io.on("connection", function callback(socket) {
  const username = getUniqueUsername();
  console.log(`${username} connected`);

  // send the chat history to the client
  socket.emit("receive-messages", {
    chatHistory: getAllMessages(),
    username,
  });

  // listen for new messages from the client
  socket.on("post-message", function receiveMessages(data) {
    const { message } = data || { message: "" };
    console.log(message);
    chatHistory.push({
      username,
      message,
    });

    // send the updated chat history to all clients
    io.emit("receive-messages", {
      chatHistory: getAllMessages(),
    });
  });

  // listen for disconnects and log them
  socket.on("disconnect", () => {
    console.log(`${username} disconnected`);
  });
});

// Boilerplate code as well as Bonus section
// HTTP server setup to serve the page assets
app.use(express.static(process.cwd() + "/frontend"));

// HTTP server setup to serve the page at / route
app.get("/", (req, res) => {
  return res.sendFile(process.cwd() + "/frontend/index.html");
});

// start the HTTP server to serve the page
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// helper functions
// get all messages in the order they were sent
function getAllMessages() {
  return Array.from(chatHistory).reverse();
}

// generate a unique username for each user
function getUniqueUsername() {
  return uniqueNamesGenerator({
    dictionaries: [names, colors],
    length: 2,
    style: "capital",
    separator: " ",
  });
}


//const PORT = process.env.PORT || 3000;
//server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

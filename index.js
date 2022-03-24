// Import the client from your db/index.js
const client = require("./db/client");
client.connect();

// Use the dotenv package, to create environment variables
const dotenv = require("dotenv");
dotenv.config();

// Create a constant variable, PORT, based on what's in process.env.PORT or fallback to 3000
const PORT = process.env.PORT || 3000;

// Import express, and create a server
const express = require("express");
const server = express();

// Require morgan and body-parser middleware
const morgan = require("morgan");

// Have the server use morgan with setting 'dev'
server.use(morgan("dev"));

// Import cors
const cors = require("cors");
// Have the server use cors()
server.use(cors());

// Have the server use bodyParser.json()
server.use(express.json());

// Have the server use your api router with prefix '/api'
const apiRouter = require("./api");
server.use("/api", apiRouter);

server.listen(PORT, () => {
  console.log("The server is up on port", PORT);
});

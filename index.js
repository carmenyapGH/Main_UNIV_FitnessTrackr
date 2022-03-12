// create the express server here

const express = require("express");

const client = require("./db/client");

const PORT = process.env.PORT || 3000;

const app = express();

require("dotenv").config();
const SECRET = process.env.SECRET;

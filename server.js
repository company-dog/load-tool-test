const express = require("express");
const morgan = require("morgan");
const app = express();

// Setting Middleware
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setting Routing
app.get("/", (req, res) => res.send("Hello Perf Server!"));
app.get("/ping", (req, res) => res.send(req.query.message));
app.post("/ping", (req, res) => res.send(req.body.message));

app.listen(5500, () => console.log("Server Listening port on 5500..."));

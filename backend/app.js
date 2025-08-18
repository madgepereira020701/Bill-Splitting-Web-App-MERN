const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const scanRoute = require("./scan.js");

const app = express();
const port = 3000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));

// ✅ Mount scanRoute at /api
app.use("/api", scanRoute);

app.listen(port, () => {
  console.log("Connected to backend on port", port);
});

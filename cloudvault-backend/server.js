const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/files", require("./routes/upload"));
app.use("/api/files/download", require("./routes/download"));

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

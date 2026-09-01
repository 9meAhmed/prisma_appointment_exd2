const express = require("express");

const app = express();
app.use(express.json());

const router = express.Router();

router.use('/auth', require('./routes/authRoutes'));

app.use('/api', router);

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

module.exports = app;

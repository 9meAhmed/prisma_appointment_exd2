const express = require("express");
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const router = express.Router();
router.use('/auth',  require('./routes/authRoutes'));
router.use('/appointments',  require('./routes/appointmentRoutes'));

app.use('/api', router);

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

module.exports = app;

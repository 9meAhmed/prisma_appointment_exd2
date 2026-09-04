const express = require("express");
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const validate = require("../middlewares/validate");
const { createAppointmentSchema } = require("../validations/createAppointmentValidation");


router.get("/", appointmentController.get);
router.post("/", validate(createAppointmentSchema), appointmentController.create);
router.put("/:id", appointmentController.update);
router.delete("/:id", appointmentController.delete);

module.exports = router;
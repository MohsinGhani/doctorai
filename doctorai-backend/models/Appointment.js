const mongoose = require("mongoose");
// Get the Schema constructor
var Schema = mongoose.Schema;

// Using Schema constructor, create a AppointmentSchema
const AppointmentSchema = new Schema({
  date: { type: Date, required: true },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  patient: {
    type: Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  appointedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["SCHEDULED", "CANCELED"],
    default: "SCHEDULED",
    required: true,
  },
});

// Create model from the schema
var Appointment = mongoose.model("Appointment", AppointmentSchema);

// Export model
module.exports = Appointment;

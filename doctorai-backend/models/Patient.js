const mongoose = require("mongoose");
// Get the Schema constructor
var Schema = mongoose.Schema;

// Using Schema constructor, create a PatientSchema
const PatientSchema = new Schema({
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true, enum: ["Male", "Female"] },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  disease: { type: String, required: true },
  logCreatedAt: { type: Date, default: Date.now },
  logUpdatedAt: { type: Date, default: Date.now },
});

// Create model from the schema
var Patient = mongoose.model("Patient", PatientSchema);

// Export model
module.exports = Patient;

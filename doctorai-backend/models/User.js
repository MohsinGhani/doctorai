const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
// Get the Schema constructor
var Schema = mongoose.Schema;

// Using Schema constructor, create a UserSchema
const UserSchema = new Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  specialisation: { type: String, required: false, default: "" },
  password: { type: String, required: true },
  type: {
    type: String,
    enum: ["doctor", "reception"],
    default: "reception",
    required: true,
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 8);
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create model from the schema
var User = mongoose.model("User", UserSchema);

// Export model
module.exports = User;

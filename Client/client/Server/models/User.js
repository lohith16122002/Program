const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, unique: true, sparse: true, trim: true, default: undefined },
    email: { type: String, required: true, unique: true, lowercase: true },
    phoneNumber: { type: String, default: "" },
    password: { type: String, required: true },
    profileImage: { type: String, default: "" },
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

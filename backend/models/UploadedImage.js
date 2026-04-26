const mongoose = require("mongoose");

const uploadedImageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    time: {
      type: Date,
      default: Date.now
    },
    path: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    versionKey: false
  }
);

module.exports = mongoose.model("UploadedImage", uploadedImageSchema);

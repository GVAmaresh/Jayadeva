const mongoose = require("mongoose");

const userDetails = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: false,
    },
    role:{
      type: String,
      default: "user"
    },
    patients: [{
      type: mongoose.Schema.ObjectId,
      ref:"Patient",
      required: false,
    }],
  });
  
  const User = mongoose.model('User', userDetails);
  
  module.exports = User;
  export default mongoose;
  
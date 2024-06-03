const mongoose = require("mongoose");

const reportDetails = new mongoose.Schema({
  diagnosis: {
    type: String,
    required: true,
  },
  treatment: {
    type: String,
    required: true,
  },
  visitDate: {
    type: Date,
    required: true,
  },
});

const patientDetails = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    dob: {
        type: Date,
        required: true 
      },
    reports:{
        type:[reportDetails],
        required: false
    }
})

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
  patients: {
    type: [patientDetails],
    required: false,
  },
});

const UserDetails = mongoose.model('UserDetails', userDetails);

module.exports = UserDetails;
export default mongoose;

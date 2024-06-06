const mongoose = require("mongoose");

const patientDetails = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    dob: {
        type: Date,
        required: true 
      },
      gender:{
        type: String,
        required: true
      },
    reports:[{
        type: mongoose.Schema.ObjectId,
        ref: "Report",
        required: false
    }]
})

const Patient = mongoose.model('Patient', patientDetails);
  
module.exports = Patient;
export default mongoose;

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
    doctorId:{
      type: String,
      required: true,
    },
    patientId:{
      type: String,
      required: true,
    },
    assistanceId:{
      type: String,
      required: true,
    },
    visitDate: {
      type: Date,
      required: true,
    },
  });

  const Report = mongoose.model('Report', reportDetails);
  
  module.exports = Report;
  export default mongoose;
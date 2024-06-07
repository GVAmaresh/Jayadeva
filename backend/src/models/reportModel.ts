import { Document } from "mongoose";

const mongoose = require("mongoose");

export interface ReportInterface extends Document{
  diagnosis: string;
  treatments: string
  doctorId: string;
  patientId: string;
  assistanceId: string;
  visitDate: Date;
}
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
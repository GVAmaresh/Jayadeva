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
      type: mongoose.Schema.ObjectId,
      ref:"Administration",
      required: true,
    },
    patientId:{
      type: mongoose.Schema.ObjectId,
      ref:"Patient",
      required: true,
    },
    assistanceId:{
      type: mongoose.Schema.ObjectId,
      ref:"Administration",
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
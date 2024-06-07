const mongoose = require("mongoose");
import { Document, Schema } from "mongoose";
import { ReportInterface } from "./reportModel";
export interface PatientInterface extends Document{
  name: string;
  dob: Date;
  gender: string;
  reports:ReportInterface[]
}
const patientDetails:Schema<PatientInterface> = new mongoose.Schema({
  name: {
    type: String,
  },
  dob: {
    type: Date,
  },
  gender: {
    type: String,
  },
  reports: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Report",
      required: false,
    },
  ],
},{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

patientDetails.virtual<PatientInterface>("patients", {
  ref:"User",
  localField:"_id",
  foreignField:"patients"
});

const Patient = mongoose.model("Patient", patientDetails);

module.exports = Patient;
export default mongoose;

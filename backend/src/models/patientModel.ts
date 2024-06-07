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
});

patientDetails.virtual<PatientInterface>("user", {
  ref:"User",
  localField:"_id",
  foreignField:"user"
});

const Patient = mongoose.model("Patient", patientDetails);

module.exports = Patient;
export default mongoose;

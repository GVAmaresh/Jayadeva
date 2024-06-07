import mongoose from "mongoose";

const actionRecords = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.ObjectId,
    ref: "Report",
    required: true,
  },
  patientId: { type: mongoose.Schema.ObjectId, ref: "Patient", required: true },
  role: { type: String, required: true },
  operation: { type: String, required: true },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "Administration",
    required: true,
  },
  visitDate: { type: Date, default: new Date() },
});

const ActionRecords = mongoose.model("ActionRecords", actionRecords);
export default ActionRecords;

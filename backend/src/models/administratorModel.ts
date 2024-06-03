import mongoose, { Schema, Document, Model } from "mongoose";
import bcryptjs from "bcryptjs";

interface PatientDetails {
  patientName: string;
  patientId: string;
  reportId: string;
  userId: string;
}

interface Administrator extends Document {
  name: string;
  dob: Date;
  email: string;
  education:string;
  password: string;
  phone: string;
  address: string;
  position: string;
  role: string;
  recordedBy?: PatientDetails[];
  date: Date;
  correctPassword: (
    candidatePassword: string,
    userPassword: string
  ) => Promise<boolean>;
}

const patientDetailsSchema: Schema<PatientDetails> = new Schema({
  patientName: {
    type: String,
    required: true,
  },
  patientId: { type: String, required: true },
  reportId: { type: String, required: true },
  userId: { type: String, required: true },
});

const administratorDetailsSchema: Schema<Administrator> = new Schema({
  name: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  education: { type: String, required: true },
  position: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: "assistant",
  },
  recordedBy: {
    type: [patientDetailsSchema],
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

administratorDetailsSchema.pre<Administrator>(
  "save",
  async function (this: Administrator, next) {
    if (!this.isModified("password")) return next();

    this.password = await bcryptjs.hash(this.password, 12);
    next();
  }
);

administratorDetailsSchema.methods.correctPassword = async function (
  this: Administrator,
  candidatePassword: string,
  userPassword: string
): Promise<boolean> {
  return await bcryptjs.compare(candidatePassword, userPassword);
};

const AdministratorDetails: Model<Administrator> =
  mongoose.model<Administrator>(
    "AdministratorDetails",
    administratorDetailsSchema
  );

export default AdministratorDetails;

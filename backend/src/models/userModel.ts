import { NextFunction } from "express";
import { PatientInterface } from "./patientModel";
import { Document, Schema } from "mongoose";
const mongoose = require("mongoose");
interface UserInterface extends Document{
  name: string;
  dob:Date;
  gender:string;
  address:string;
  phone:number;
  email:string;
  role:string;
  patients: PatientInterface[]
}

const userDetails:Schema<UserInterface> = new mongoose.Schema({
    name: {
      type: String,
      
    },
    dob: {
      type: Date,
      
    },
    gender: {
      type: String,
      
    },
    address: {
      type: String,
      
    },
    phone: {
      type: Number,
      
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
        ref: 'Patient',
    }
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });
  
  const User = mongoose.model('User', userDetails);
  userDetails.pre<UserInterface>(/^find/, function(next){
    this.populate({
      path:"patients",
      // select:"name"
    })
  })
  
  
  
  module.exports = User;
  export default mongoose;
  
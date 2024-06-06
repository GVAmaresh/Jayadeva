import { NextFunction, Request, Response } from "express";
import Patient from "../models/patientModel";
import User from "../models/userModel";
import {
  createSendToken,
  protectAdministrator,
  protectUser,
} from "./authController";

export const signupUser = async (req: Request, res: Response) => {
  try {
    const { name, dob, gender, address, phone, email } = req.body;
    if (!name || !dob || !gender || !address || !phone) {
      res.status(400).json({ message: "Please fill all the fields" });
      return;
    }
    const availablePatient = await User.findOne({ phone: phone });
    if (availablePatient) {
      res.status(409).json({
        message: "You already registered through this phone number",
        data: null,
      });
      return;
    }
    const patientDetails = await User.create({
      name,
      dob,
      gender,
      address,
      phone,
      email,
      role: "patient",
    });
    createSendToken(patientDetails, 201, req, res);
  } catch (err: any) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const signupPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await protectUser(req, res, next);

    const currentUser = res.locals.user;
    if (!currentUser) {
      return res.status(401).json({
        message: "Invalid Authentication",
        data: null,
        isLogin: false,
      });
    }

    const { name, dob, gender } = req.body;
    if (!name || !dob || !gender) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const existingPatients = await Promise.all(
      currentUser.patients.map((patientId: string) =>
        Patient.findById(patientId)
      )
    );

    const duplicatePatient = existingPatients.find(
      (patient) => patient && patient.name === name
    );

    if (duplicatePatient) {
      res.status(409).json({
        message: "You already registered through this phone number",
        data: null,
      });
      return;
    }

    const newPatient = await Patient.create({ name, dob, gender });
    currentUser.patients.push(newPatient._id);
    await currentUser.save();

    return res.status(200).json({
      message: "Patient created successfully",
      data: newPatient,
      isLogin: true,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

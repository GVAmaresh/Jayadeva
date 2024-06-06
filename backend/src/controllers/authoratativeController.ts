import { createSendToken, protectAdministrator } from "./authController";
import { NextFunction, Request, Response } from "express";
import Administrator from "../models/administratorModel";
import Patient from "../models/patientModel";
import Report from "../models/reportModel";

export const signupAdminPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      dob,
      email,
      password,
      phone,
      address,
      position,
      education,
      role,
    } = req.body;

    ///////////////////////////// to verify where it is admin or not ///////////////////////////////

    await protectAdministrator(req, res, next);

    const currentUser = res.locals.user;
    if (!currentUser) {
      return res.status(401).json({
        message: "Invalid Authentication",
        data: null,
        isLogin: false,
      });
    }
    /////////////////////////////////////////////////////////////////////////////
    if (currentUser.role !== "admin") {
      res.status(401).json({
        message: "Invalid Authentication",
        data: null,
        isLogin: false,
      });
      return;
    }
    if (
      !name ||
      !dob ||
      !email ||
      !password ||
      !phone ||
      !address ||
      !position ||
      !education ||
      !role
    ) {
      return res
        .status(400)
        .json({ message: "All fields are required", data: null });
    }
    const availableAdmin = await Administrator.findOne({ email });
    if (availableAdmin) {
      return res.status(409).json({
        message: "You are already registered with this email",
        data: null,
      });
    }
    const administratorDetails = await Administrator.create({
      name,
      dob,
      email,
      education,
      password,
      phone,
      address,
      position,
      role,
    });

    createSendToken(administratorDetails, 201, req, res);
  } catch (err: any) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const addReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await protectAdministrator(req, res, next);
    const currentUser = res.locals.user;
    if (!currentUser) {
      return res.status(401).json({
        message: "Invalid Authentication",
        data: null,
        isLogin: false,
      });
    }
    if(currentUser.role !== "assistant"){
        return res.status(401).json({
            message: "Invalid Authentication",
            data: null,
            isLogin: false,
        });
    }
    const { patientId, doctorId, diagnosis, treatment } = req.body;
    const patientDetails = await Patient.findById(patientId);
    if (!patientDetails) {
        return res.status(404).json({
            message: "Patient not found",
            status: 404,
        });
    }
    const reportDetails = await Report.create({
      diagnosis,
      treatment,
      patientId,
      doctorId,
      assistanceId: currentUser.id,
      visitDate: new Date(),
    });

    patientDetails.reports.push(reportDetails);
    await patientDetails.save();

    res.status(200).json({
      message: "Report created successfully",
      status: 200,
      data: reportDetails,
    });
    return;
  } catch (err: any) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

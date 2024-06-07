import { createSendToken, protectAdministrator } from "./authController";
import { NextFunction, Request, Response } from "express";
import Administrator from "../models/administratorModel";
import Patient from "../models/patientModel";
import Report from "../models/reportModel";
import ActionRecords from "../models/actionRecord";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

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

const createDirectoryIfNotExists = (directory: string) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

const createPDF = (data: any, outputPath: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(outputPath);

    doc.pipe(writeStream);

    doc.fontSize(25).text('Medical Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Diagnosis: ${data.diagnosis}`);
    doc.text(`Treatment: ${data.treatment}`);
    doc.text(`Doctor ID: ${data.doctorId}`);
    doc.text(`Patient ID: ${data.patientId}`);
    doc.text(`Assistance ID: ${data.assistanceId}`);
    doc.text(`Visit Date: ${new Date(data.visitDate).toLocaleString()}`);

    doc.end();

    writeStream.on('finish', () => {
      resolve();
    });

    writeStream.on('error', (err) => {
      reject(err);
    });
  });
};


export const addReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await protectAdministrator(req, res, next);
    const currentUser = await res.locals.user;
    console.log(currentUser);
    if (!currentUser) {
      return res.status(401).json({
        message: "Invalid Authentication",
        data: null,
        isLogin: false,
      });
    }
    if(currentUser.role !== "doctor" && currentUser.role!== "admin"){
        return res.status(401).json({
            message: "Invalid Authentication",
            data: null,
            isLogin: false,
        });
    }
    const { patientId, doctorId, diagnosis, treatment } = req.body;
    if (!patientId || !doctorId) {
      return res.status(400).json({
        message: "patientId and doctorId required",
      });
    }
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
    
    //generate pdf
    const patientName = patientDetails.name.replace(/\s+/g, '-'); // Replace spaces with dashes

    // Ensure the reports directory exists
    const reportsDirectory = path.join(__dirname, '../reports');
    createDirectoryIfNotExists(reportsDirectory);

    // Generate unique filename using patient name and timestamp
    const timestamp = Date.now();
    const pdfPath = path.join(reportsDirectory, `${patientName}-report-${timestamp}.pdf`);
    await createPDF(reportDetails, pdfPath);


    patientDetails.reports.push(reportDetails);
    const actionRecord = await ActionRecords.create({reportId: reportDetails._id, patientId, operation: "Create A Record", userId:currentUser._id, role: currentUser.role})
    if(!actionRecord){
      return res.status(500).json({ message: "Server error", error: "Details Are not saving in the databases" });
    }
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

export const editReport = async(req:Request, res:Response, next:NextFunction) => {
  await protectAdministrator(req ,res, next)
  const currentUser = res.locals.user;
  if (!currentUser) {
    return res.status(401).json({
      message: "Invalid Authentication",
      data: null,
      isLogin: false,
    });
  }
  if(currentUser.role!== "doctor" && currentUser.role!== "admin"){
    return res.status(401).json({
        message: "Invalid Authentication",
        data: null,
        isLogin: false,
    });
}
  const { reportId, diagnosis, treatment } = req.body;
  const reportDetails = await Report.findById(reportId);
  if(!reportDetails){
    return res.status(404).json({
      message: "Report not found",
      status: 404,
    });
  }
  reportDetails.diagnosis = diagnosis;
  reportDetails.treatment = treatment;
  const actionRecord = await ActionRecords.create({reportId: reportDetails._id, patientId:reportDetails.patientId, operation: "Edit A Record", userId:currentUser._id, role:currentUser.role})
  if(!actionRecord){
    return res.status(500).json({ message: "Server error", error: "Details Are not saving in the databases" });
  }
  await reportDetails.save();
  res.status(200).json({
    message: "Report updated successfully",
    status: 200,
    data: reportDetails,
  });
}

export const deleteReport = async(req:Request, res:Response, next:NextFunction) => {
  await protectAdministrator(req, res, next);
  const currentUser = res.locals.user;
  if (!currentUser) {
    return res.status(401).json({
      message: "Invalid Authentication",
      data: null,
      isLogin: false,
    });
  }
  if(currentUser.role!== "doctor" && currentUser.role!== "admin"){
    return res.status(401).json({
        message: "Invalid Authentication",
        data: null,
        isLogin: false,
    });
}
  const { reportId } = req.body;
  const reportDetails = await Report.findByIdAndDelete(reportId);
  if(!reportDetails){
    return res.status(404).json({
      message: "Report not found",
      status: 404,
    });
  }
  const actionRecord = await ActionRecords.create({reportId: reportDetails._id, patientId:reportDetails.patientId, operation: "Delete A Record", userId:currentUser._id, role:currentUser.role})
  if(!actionRecord){
    return res.status(500).json({ message: "Server error", error: "Details Are not saving in the databases" });
  }
  await reportDetails.remove();
  res.status(200).json({
    message: "Report deleted successfully",
    status: 200,
    data: reportDetails,
  });
}
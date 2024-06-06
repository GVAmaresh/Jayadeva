// import { NextFunction, Request, Response } from 'express';
// import { protectAdministrator } from './authController';
// const Administrator = require("../models/administratorModel");
// const Patient = require("../models/patientModel");

// export const createReport = async (req: Request, res: Response, next:NextFunction) => {
//     try {
//         const { diagnosis, treatment, visitDate, userId, patientId, doctorId, assistanceId } = req.body;
//         if (!diagnosis || !treatment || !visitDate || !patientId || !userId || !doctorId || !assistanceId) {
//             return res.status(400).json({
//                 message: "All fields are required",
//                 status: 400,
//             });
//         }
    
//         await protectAdministrator(req, res, next)
//         const currentUser = res.locals.user;
//         if (!currentUser) {
//           return res
//             .status(401)
//             .json({
//               message: "Invalid Authentication",
//               data: null,
//               isLogin: false,
//             });
//         }
//         if(currentUser.role !== "assistant"){
//             return res.status(401).json({
//                 message: "Invalid Authentication",
//                 data: null,
//                 isLogin: false,
//             });
//         }
//         const userDetails = await Patient.findById(userId)
//         if (!userDetails) {
//             return res.status(404).json({
//                 message: "Patient not found",
//                 status: 404,
//             });
//         }
//         const patientDetails = await userDetails.patients.findById(patientId)
//         if (!patientDetails) {
//             return res.status(404).json({
//                 message: "Patient not found",
//                 status: 404,
//             });
//         }

//         const reportDetails = await patientDetails.reports.create({
//             diagnosis,
//             treatment,
//             doctorId,
//             assistanceId,
//             visitDate,
//         });
//         await patientDetails.save();
//         const doctorDetails = await Administrator.findById(doctorId)
//         if (!doctorDetails) {
//             return res.status(404).json({
//                 message: "Doctor not found",
//                 status: 404,
//             });
//         }
//         const assistantDetails = await Administrator.findById(assistanceId)
//         if (!assistantDetails) {
//             return res.status(404).json({
//                 message: "Assistant not found",
//                 status: 404,
//             });
//         }
//         const doctorRecord = doctorDetails.recordedBy.create({
//             patientName: patientDetails.name,
//             patientId, userId, reportDetails.id
//         })
//         const assistanceRecord = assistantDetails.recordedBy.create({
//             patientName: patientDetails.name,
//             patientId, userId, reportDetails.id
//         })
//         res.status(200).json({
//             message: "Report created successfully",
//             status: 200,
//             data: reportDetails,
//         });
//     } catch (err:any) {
//         res.status(500).json({
//             message: "Server error",
//             error: err.message
//         });
//     }
// };

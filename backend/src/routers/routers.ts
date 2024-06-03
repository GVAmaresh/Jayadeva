import { Router, Request, Response } from "express";
import {
  login,
  signupPatient,
  signupThroughAdmin,
} from "../controllers/authController";
import Administrator from "../models/administratorModel";

const router = Router();

router.get("/check-working", (req: Request, res: Response) => {
  return res.status(200).json({
    message: "Server is working properly",
    status: 200,
  });
});

router.post("/login", login);
router.post("/signup", signupPatient);
router.post("/signupTAdmin", signupThroughAdmin);

// router.post("/exception", async(req: Request, res: Response) => {
//   const administratorDetails = await Administrator.create({
//     name: "amaresh",
//     dob: "2003-01-02",
//     email: "amaresh@gmail.com",
//     password: "pass123",
//     education: "msc",
//     phone: "7890345678",
//     address: "22nd street banashankari",
//     position: "Admin",
//     role: "admin",
//   });
//   res.status(200).json({
//     message:"Successfully updated administrator",
//     status:200,
//     data:administratorDetails,
//   })
// });

export default router;

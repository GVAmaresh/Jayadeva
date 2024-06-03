import { Request, Response } from "express";
import Patient from "../models/patientModel";
import Administrator from "../models/administratorModel";

interface RoleMapping {
  [key: string]: string;
}

export const signupPatient = async (req: Request, res: Response) => {
  try {
    const { name, dob, gender, address, phone, email } = req.body;
    if (!name || !dob || !gender || !address || !phone) {
      res.status(400).json({ message: "Please fill all the fields" });
      return;
    }
    const availablePatient = await Patient.findOne({ phone: phone });
    if (availablePatient){
      res.status(409).json({"message": "You already registered through this phone number", data: null})
      return;
    } 
    const patientDetails = await Patient.create({
      name,
      dob,
      gender,
      address,
      phone,
      email,
      role: "patient",
    });

    res.status(200).json({
      message: "Successfully created patient",
      data: patientDetails,
      isLogin: true,
    });
  } catch (err: any) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const signupThroughAdmin = async (req: Request, res: Response) => {
  try {
    const {
      user,
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
    console.log(user)

    ///////////////////////////// to verify where it is admin or not ///////////////////////////////
    if (!user || !user.email || !user.role) {
      return res.status(401).json({ message: "Invalid Authentication", data: null, isLogin: false });
    }

    const admin = await Administrator.findOne({ email: user.email });
    console.log(admin, user.role)
    if (!admin || user.role !== "admin") {
      return res.status(401).json({ message: "Invalid Authentication", data: null, isLogin: false, admin:admin, role:user.role });
    }
/////////////////////////////////

    if (
      !user ||
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

    res.status(200).json({
      message: `Successfully created ${role}`,
      data: administratorDetails,
      isLogin: true,
    });
  } catch (err: any) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone = "", email = "", password = "" } = req.body;

    let user;
    console.log(phone, email, password);
    if (phone) {
      user = await Patient.findOne({ phone });
      const role = user ? "user" : null;
      const message = user
        ? "Successfully login as a Patient"
        : "Failed to login as a Patient";
      res
        .status(200)
        .json({ message, isLogin: !!user, data: user || phone, role });
    } else {
      user = await Administrator.findOne({ email }).select("+password");
      const isValidUser =
        user && (await user.correctPassword(password, user.password));
      if (!isValidUser) {
        res.status(400).json({
          message: "Invalid email or password",
          isLogin: false,
          data: null,
        });
        return;
      }
      const roleMapping: RoleMapping = {
        admin: "Administrator",
        doctor: "Doctor",
        assistant: "Assistant",
      };

      const role = (user && roleMapping[user.role]) || "Assistant";
      res.status(200).json({
        message: `Successfully login as a ${role}`,
        isLogin: true,
        data: user,
        role,
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

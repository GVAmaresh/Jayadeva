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
    const patientDetails = await Patient.create({
      name,
      dob,
      gender,
      address,
      phone,
      email,
      role: "user",
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
    const { user, name, dob, email, password, phone, address, position, role } =
      req.body;
    if (!user || !Administrator.findOne(user.email) || user.role !== "admin") {
      return res
        .status(401)
        .json({ message: "Invalid Authenticaton", data: null, isLogin: false });
    }
    const administratorDetails = Administrator.create({
      user,
      name,
      dob,
      email,
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

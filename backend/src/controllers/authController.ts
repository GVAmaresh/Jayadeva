import { NextFunction, Request, Response } from "express";
import Patient from "../models/patientModel";
import Administrator from "../models/administratorModel";
import User from "../models/userModel";

const { promisify } = require("util");
const jwt = require("jsonwebtoken");
interface RoleMapping {
  [key: string]: string;
}

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const createSendToken = (
  user: any,
  statusCode: number,
  req: Request,
  res: Response
) => {
  const token = signToken(user._id);
  const expiresIn = process.env.JWT_COOKIE_EXPIRES_IN
    ? parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10)
    : 7;

  res.cookie("jwt", token, {
    expires: new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};



export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone = "", email = "", password = "" } = req.body;
    let user;
    if (phone) {
      user = await User.findOne({ phone });
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
      createSendToken(user, 202, req, res);
    }
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const protectAdministrator = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (true) {
      const decoded = await promisify(jwt.verify)(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NjIwZTk1ZDYyN2VmNzBiZDQ4YzA0MCIsImlhdCI6MTcxNzcwMzMwNiwiZXhwIjoxNzI1NDc5MzA2fQ.tFT3HHRhoJbHlf7v50HgC9zUKHEQ5OnslDq4Z0qYA6s",
        process.env.JWT_SECRET
      );
      const currentUser = await Administrator.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      res.locals.user = currentUser;
      
    } else {
      // res.status(400).json({ message: "Token not found" });
      return next();
    }
  } catch (err: any) {
    // res.status(400).json({ message: "Error during authentication", error: err.message });
    return next(err);
  }
};


export const protectUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (true) {
      const decoded = await promisify(jwt.verify)(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NjIwNjBhYTU1MzM4ZGY0M2FiZDgxMSIsImlhdCI6MTcxNzcwMDEwNywiZXhwIjoxNzI1NDc2MTA3fQ.FY75UjPqevSr7iN4Kpn-3wnFxrMxxiMzirruzWnd3Vc",
        process.env.JWT_SECRET
      );
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        next();
      }
      
      res.locals.user = currentUser;
      // next();
    } else {
      // res.status(400).json({ message: "Token not found" });
      return next();
    }
  } catch (err: any) {
    // res.status(400).json({ message: "Error during authentication", error: err.message });
    return next(err);
  }
};

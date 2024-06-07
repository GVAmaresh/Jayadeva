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
      user.populate("patients");
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
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    console.log(token);
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await Administrator.findById(decoded.id);
    if (!currentUser) {
      return next();
    }

    res.locals.user = currentUser;
  } catch (err: any) {
    res.status(400).json({ message: "Error during authentication", error: err.message });
    return next(err);
  }
};

export const protectUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      next();
    }

    res.locals.user = currentUser;
    // next();
  } catch (err: any) {
    // res.status(400).json({ message: "Error during authentication", error: err.message });
    return next(err);
  }
};

export const isLoggedIn = async (req: Request, res: Response) => {
  try {
    let token;
    const { role } = req.body.role;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser && currentUser.role !== role) {
      return res.status(401).json({
        message: "You are not authorized",
        authorized: false,
      });
    }
    return res.status(200).json({
      message: "You are authorized",
      authorized: true,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Server not logged",
      error: err.message,
    });
  }
};

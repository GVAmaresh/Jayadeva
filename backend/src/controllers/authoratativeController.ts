import { createSendToken, protectAdministrator } from "./authController";
import { NextFunction, Request, Response } from "express";
import Administrator from "../models/administratorModel";

export const signupThroughAdmin = async (
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
        return res
          .status(401)
          .json({
            message: "Invalid Authentication",
            data: null,
            isLogin: false,
          });
      }
      /////////////////////////////////////////////////////////////////////////////
      console.log(currentUser);
      if (currentUser.role !== "admin") {
        res
          .status(401)
          .json({
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
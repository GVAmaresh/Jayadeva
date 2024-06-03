import { Router, Request, Response } from 'express';
import {login, signupPatient} from "../controllers/authController"

const router = Router();

router.get("/check-working", (req: Request, res: Response) => {
    return res.status(200).json({
        message: "Server is working properly",
        status: 200,
    });
});

router.post("/login", login);
router.post("/signup", signupPatient);
router.post("/signupTAdmin", signupPatient);

export default router;

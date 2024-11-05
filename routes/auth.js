import express from "express";
import validateBody from "../middlewares/validateBody.js";
import { schemas } from "../models/users.js";
import authControllers from "../controllers/auth.js";

const authRouter = express.Router();

// signup
authRouter.post(
  "/register",
  validateBody(schemas.userRegisterSchema),
  authControllers.register
);

authRouter.get("/verify/:verificationCode", authControllers.verify);

authRouter.post(
  "/verify",
  validateBody(schemas.userEmailSchema),
  authControllers.resendVerifyEmail
);

export default authRouter;

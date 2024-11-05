import express from "express";
import validateBody from "../middlewares/validateBody.js";
import { schemas } from "../models/users.js";
import authControllers from "../controllers/auth.js";
import { authenticate } from "../middlewares/authenticate.js";

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

// signin
authRouter.post(
  "/login",
  validateBody(schemas.userLoginSchema),
  authControllers.login
);

authRouter.get("/current", authenticate, authControllers.getCurrent);

export default authRouter;

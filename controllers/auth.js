import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

import { User } from "../models/users.js";
import { ctrlWrapper } from "../decorators/ctrlWrapper.js";
import HttpError from "../helpers/HttpError.js";
import { sendEmail } from "../helpers/sendEmail.js";

const { SECRET_KEY, PROJECT_URL } = process.env;

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email already exist");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const verificationCode = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    verificationCode,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<h1>Verify your email</h1>
     <p>Please click the link below to verify your email</p>
     <p><a target="_blank" href="${PROJECT_URL}/api/users/verify/${verificationCode}">Click to verify email</a></p>`,
  };

  await sendEmail(verifyEmail);

  const { _id: id } = newUser;

  const payload = {
    id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });

  res.status(201).json({
    token,
    user: {
      name: newUser.name,
      email: newUser.email,
    },
  });
};

const verify = async (req, res) => {
  const { verificationCode } = req.params;
  const user = await User.findOne({ verificationCode });
  if (!user) {
    throw HttpError(404);
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationCode: "",
  });

  res.json({
    message: "Verify success",
  });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(404);
  }
  if (user.verify) {
    throw HttpError(400, "Email already verify");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${PROJECT_URL}/api/users/verify/${user.verificationCode}">Click to verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message: "Verify email send",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.verify) {
    throw HttpError(401);
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401);
  }

  const { _id: id } = user;

  const payload = {
    id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(id, { token });

  res.json({
    token,
    user: {
      name: user.name,
      email: user.email,
    },
  });
};

const getCurrent = async (req, res) => {
  const { token, email, name } = req.user;

  res.json({
    token,
    user: {
      email,
      name,
    },
  });
};

export default {
  register: ctrlWrapper(register),
  verify: ctrlWrapper(verify),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
};

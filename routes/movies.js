import express from "express";
import moviesControllers from "../controllers/movies.js";
import validateBody from "../middlewares/validateBody.js";
import { upload } from "../middlewares/upload.js";
import { schemas } from "../models/movie.js";
import { authenticate } from "../middlewares/authenticate.js";

const moviesRouter = express.Router();

moviesRouter.get("/", moviesControllers.getAllMovies);

moviesRouter.post(
  "/",
  authenticate,
  upload.single("poster"),
  validateBody(schemas.movieAddSchema),
  moviesControllers.addMovie
);

export default moviesRouter;

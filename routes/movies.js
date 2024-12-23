import express from "express";
import moviesControllers from "../controllers/movies.js";
import validateBody from "../middlewares/validateBody.js";
import { upload } from "../middlewares/upload.js";
import { schemas } from "../models/movie.js";
import { authenticate } from "../middlewares/authenticate.js";
import { isValidId } from "../middlewares/isValidId.js";

const moviesRouter = express.Router();
moviesRouter.use(authenticate);

moviesRouter.get("/", moviesControllers.getAllMovies);

moviesRouter.get("/:id", isValidId, moviesControllers.getMovieById);

moviesRouter.post(
  "/",
  upload.single("poster"),
  validateBody(schemas.movieAddSchema),
  moviesControllers.addMovie
);

moviesRouter.put(
  "/:id",
  isValidId,
  upload.single("poster"),
  validateBody(schemas.movieUpdateSchema),
  moviesControllers.updateMovieById
);

moviesRouter.patch(
  "/:id/favorite",
  isValidId,
  validateBody(schemas.updateFavoriteMovieSchema),
  moviesControllers.updateMovieFavorite
);

moviesRouter.delete("/:id", isValidId, moviesControllers.deleteMovieById);

export default moviesRouter;

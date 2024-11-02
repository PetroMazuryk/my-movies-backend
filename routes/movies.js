import express from "express";
import moviesControllers from "../controllers/movies.js";
const moviesRouter = express.Router();

moviesRouter.get("/", moviesControllers.getAllMovies);

export default moviesRouter;

import fs from "fs/promises";
import path from "path";
import { Movie } from "../models/movie.js";
import { ctrlWrapper } from "../decorators/ctrlWrapper.js";
import HttpError from "../helpers/HttpError.js";

const moviesPath = path.resolve("public", "movies");

const getAllMovies = async (req, res) => {
  const result = await Movie.find();
  res.json(result);
};

const addMovie = async (req, res) => {
  if (!req.file) {
    throw HttpError(400, "File is required");
  }

  const { path: oldPath, filename } = req.file;
  const newPath = path.join(moviesPath, filename);
  await fs.rename(oldPath, newPath);
  const poster = path.join("movies", filename);
  const { _id: owner } = req.user;
  const result = await Movie.create({ ...req.body, poster, owner });

  res.status(201).json(result);
};

export default {
  addMovie: ctrlWrapper(addMovie),
  getAllMovies: ctrlWrapper(getAllMovies),
};

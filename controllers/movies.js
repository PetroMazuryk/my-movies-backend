import fs from "fs/promises";
import path from "path";
import { Movie } from "../models/movie.js";
import { ctrlWrapper } from "../decorators/ctrlWrapper.js";
import HttpError from "../helpers/HttpError.js";

const moviesPath = path.resolve("public", "movies");

const getAllMovies = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const result = await Movie.find({ owner }, "-createdAt -updatedAt", {
    skip,
    limit,
  }).populate("owner", "email name");

  res.json(result);
};

const getMovieById = async (req, res) => {
  const { id } = req.params;
  // const result = await Movie.findOne({_id: id});
  const result = await Movie.findById(id);

  if (!result) {
    throw HttpError(404, `Movie with id=${id} not found`);
  }

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

const updateMovieById = async (req, res) => {
  const { id } = req.params;
  const result = await Movie.findByIdAndUpdate(id, req.body, { new: true });
  if (!result) {
    throw HttpError(404, `Movie with id=${id} not found`);
  }

  res.json(result);
};

const updateMovieFavorite = async (req, res) => {
  const { id } = req.params;
  const result = await Movie.findByIdAndUpdate(id, req.body, { new: true });
  if (!result) {
    throw HttpError(404, `Movie with id=${id} not found`);
  }

  res.json(result);
};

export default {
  addMovie: ctrlWrapper(addMovie),
  getAllMovies: ctrlWrapper(getAllMovies),
  getMovieById: ctrlWrapper(getMovieById),
  updateMovieById: ctrlWrapper(updateMovieById),
  updateMovieFavorite: ctrlWrapper(updateMovieFavorite),
};

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Movie } from "../models/movie.js";
import { ctrlWrapper } from "../decorators/ctrlWrapper.js";
import HttpError from "../helpers/HttpError.js";

const moviesPath = path.resolve("public", "movies");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const moviesFolder = path.join(__dirname, "../public");

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

// const deleteMovieById = async (req, res) => {
//   const { id } = req.params;
//   const result = await Movie.findByIdAndDelete(id);
//   if (!result) {
//     throw HttpError(404, `Movie with id=${id} not found`);
//   }

//   res.json({
//     message: "Delete success",
//     result,
//   });
// };

const deleteMovieById = async (req, res) => {
  const { id } = req.params;

  const movie = await Movie.findById(id);
  if (!movie) {
    throw HttpError(404, `Movie with id=${id} not found`);
  }

  if (movie.poster) {
    const filePath = path.join(moviesFolder, movie.poster);
    try {
      await fs.unlink(filePath);
      console.log(`File deleted successfully: ${filePath}`);
    } catch (error) {
      console.error(`Error deleting file: ${filePath}`, error.message);
    }
  }

  await Movie.findByIdAndDelete(id);

  res.json({
    message: "Delete success",
    result: movie,
  });
};

export default {
  addMovie: ctrlWrapper(addMovie),
  getAllMovies: ctrlWrapper(getAllMovies),
  getMovieById: ctrlWrapper(getMovieById),
  updateMovieById: ctrlWrapper(updateMovieById),
  updateMovieFavorite: ctrlWrapper(updateMovieFavorite),
  deleteMovieById: ctrlWrapper(deleteMovieById),
};

export { Movie } from "../models/movie.js";
import { ctrlWrapper } from "../decorators/ctrlWrapper.js";

const getAllMovies = async (req, res) => {
  const result = await Movie.find();
  res.json(result);
};

export default {
  getAllMovies: ctrlWrapper(getAllMovies),
};

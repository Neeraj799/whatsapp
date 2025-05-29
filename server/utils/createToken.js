import jwt from "jsonwebtoken";
import envConfig from "../config/envConfig.js";

export const generateToken = (userId) => {
  const token = jwt.sign({ userId }, envConfig.general.APP_KEY);
  return token;
};

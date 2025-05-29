import dotenv from "dotenv";
dotenv.config();

const envConfig = {
  general: {
    PORT: process.env.PORT || 8080,
    APP_KEY: process.env.SECRET_KEY || "testkey",
  },
  db: {
    URL: process.env.MONGO_URL,
  },
  cloudinary: {},
};

export default envConfig;

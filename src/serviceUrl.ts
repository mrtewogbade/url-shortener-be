//This is where we will have all our base Urls
import dotenv from "dotenv";
dotenv.config();
export const PORT = process.env.PORT;
export const DB_URI = process.env.DB_URI;
export const NODE_ENV = process.env.NODE_ENV;

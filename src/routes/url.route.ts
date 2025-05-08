import express from "express";
import { encode, decode, statistics, getAllUrls, searchUrl, redirect } from "../controllers/url.controller";
import Limiter from "../middleware/rateLimit";

const router = express.Router();


router.post("/encode", Limiter, encode);
router.get("/decode/:shortUrl", Limiter, decode);
router.get("/statistics/:shortUrl", Limiter, statistics);
router.get("/all", Limiter, getAllUrls);
router.get("/search", Limiter, searchUrl);
router.get("/redirect/:shortUrl", Limiter, redirect);


export default router;
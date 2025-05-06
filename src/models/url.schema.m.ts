import { IUrl } from "../interfaces/url.schema";
import mongoose, { Schema, Document } from "mongoose";

const UrlSchema: Schema<IUrl> = new Schema({
    longUrl: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        required: true,
        unique: true
    },
    urlCode: {
        type: String,
        required: true,
        unique: true
    },
    visits: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
   
});

export const Url = mongoose.model<IUrl>("Url", UrlSchema);
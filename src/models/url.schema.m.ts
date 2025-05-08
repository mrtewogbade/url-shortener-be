import { IUrl } from "../interfaces/url.schema";
import mongoose, { Schema, Document } from "mongoose";

const UrlSchema: Schema<IUrl> = new Schema({
    longUrl: {
        type: String,
        required: [true, 'Long URL is required'],
        trim: true
    },
    shortUrl: {
        type: String,
        required: [true, 'Short URL is required'],
        unique: true,
        trim: true
    },
    urlCode: {
        type: String,
        required: [true, 'URL code is required'],
        unique: true,
        trim: true
    },
    visits: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastVisited: {
        type: Date,
        default: null
    },
    userAgentCounts: {
        type: Map,
        of: Number,
        default: {}
    },
    referrerCounts: {
        type: Map,
        of: Number,
        default: {}
    }
   
});


UrlSchema.index({ shortUrl: 1 });
UrlSchema.index({ longUrl: 1 });

export const Url = mongoose.model<IUrl>("Url", UrlSchema);
import mongoose, { Document, Schema } from "mongoose";

// IJob.d.ts
export interface IUrl extends Document {
   longUrl: string;
   shortUrl: string;
   urlCode: string;
   visits: number;
   createdAt: Date;
    
}
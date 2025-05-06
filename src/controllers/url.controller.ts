import {Request, Response, NextFunction} from 'express';
import shortid from 'shortid';
import { Url } from '../models/url.schema.m';
import AppError from '../errors/AppError';
import AppResponse from '../helpers/AppResponse';
import catchAsync from '../errors/catchAsync';
import mongoose from 'mongoose';
import { IUrl } from '../interfaces/url.schema';


export const encode = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    try {
        const existingUrl = await Url.findOne({ longUrl: url });
        if (existingUrl) return res.json({ shortUrl: existingUrl.shortUrl });

        const shortUrl = shortid.generate();
        const newUrl = new Url({ longUrl: url, shortUrl });
        await newUrl.save();
        // return AppResponse(res, "  ", 200, {});
        return AppResponse(res, 'URL encoded successfully', 200, {
            shortUrl: newUrl.shortUrl,
            longUrl: newUrl.longUrl,
            urlCode: newUrl.urlCode,
            visits: newUrl.visits,
            createdAt: newUrl.createdAt,
        });
    } catch (error) {
        return next(new AppError('Error encoding URL', 500));
    }
   
})


export const decode = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const { shortUrl } = req.params;
    if (!shortUrl) return res.status(400).json({ error: 'Short URL is required' });

    try {
        const url = await Url.findOne({ shortUrl });
        if (!url) return res.status(404).json({ error: 'URL not found' });

        url.visits += 1;
        await url.save();

        return AppResponse(res, 'URL decoded successfully', 200, {
            longUrl: url.longUrl,
            shortUrl: url.shortUrl,
            urlCode: url.urlCode,
            visits: url.visits,
            createdAt: url.createdAt,
        });
    } catch (error) {
        // return next(new AppError('Error decoding URL', 500));
        if (error instanceof mongoose.Error) {
            return next(new AppError('Database error', 500));
        }
        return next(new AppError('Error decoding URL', 500));

    }
})  

export const statistics = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const { shortUrl } = req.params;
    if (!shortUrl) return res.status(400).json({ error: 'Short URL is required' });

    try {
        const url = await Url.findOne({ shortUrl });
        if (!url) return res.status(404).json({ error: 'URL not found' });

        return AppResponse(res, 'URL statistics retrieved successfully', 200, {
            longUrl: url.longUrl,
            shortUrl: url.shortUrl,
            urlCode: url.urlCode,
            visits: url.visits,
            createdAt: url.createdAt,
        });
    } catch (error) {
        return next(new AppError('Error retrieving URL statistics', 500));
    }
})

export const getAllUrls = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const urls = await Url.find().sort({ createdAt: -1 });
        res.json(urls);

        
    } catch (error) {
        return next(new AppError('Error retrieving URLs', 500));
        
    }
})

export const seatchUrl = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const { query } = req.query;

    if (typeof query !== 'string' || query.length < 3) {
        return res.status(400).json({ error: 'Search query must be at least 3 characters long' });
    }

    try {
        const urls = await Url.find({
            longUrl: { $regex: query, $options: 'i' }
        }).sort({ createdAt: -1 });

        return AppResponse(res, 'URLs retrieved successfully', 200, urls);

    } catch (error) {
        return next(new AppError('Error searching URLs', 500));
    }   
})

// Redirect: Redirect from short URL to original URL

export const redirect = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const { shortUrl } = req.params;
    if (!shortUrl) return res.status(400).json({ error: 'Short URL is required' });

    try {
        const url = await Url.findOne({ shortUrl });
        if (!url) return res.status(404).json({ error: 'URL not found' });

        url.visits += 1;
        await url.save();

        return res.redirect(url.longUrl);
    } catch (error) {
        return next(new AppError('Error redirecting to URL', 500));
    }
})
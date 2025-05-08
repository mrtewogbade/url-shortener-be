
import { Request, Response, NextFunction } from 'express';
import shortid from 'shortid';
import { Url } from '../models/url.schema.m';
import AppError from '../errors/AppError';
import AppResponse from '../helpers/AppResponse';
import catchAsync from '../errors/catchAsync';
import mongoose from 'mongoose';

/**
 * Create a shortened URL
 * POST /api/url/encode
 */
export const encode = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { url } = req.body;
    if (!url) return next(new AppError('URL is required', 400));

    try {
        const existingUrl = await Url.findOne({ longUrl: url });
        if (existingUrl) {
            return AppResponse(res, 'URL already exists', 200, {
                shortUrl: existingUrl.shortUrl,
                longUrl: existingUrl.longUrl,
                urlCode: existingUrl.urlCode,
                visits: existingUrl.visits,
                createdAt: existingUrl.createdAt,
            });
        }

        const shortUrl = shortid.generate();
        const newUrl = new Url({
            longUrl: url,
            shortUrl,
            urlCode: shortUrl
        });
        await newUrl.save();

        return AppResponse(res, 'URL encoded successfully', 201, {
            shortUrl: newUrl.shortUrl,
            longUrl: newUrl.longUrl,
            urlCode: newUrl.urlCode,
            visits: newUrl.visits,
            createdAt: newUrl.createdAt,
        });
    } catch (error) {
        return next(new AppError('Error encoding URL', 500));
    }
});

/**
 * Decode a short URL
 * GET /api/url/decode/:shortUrl
 */
export const decode = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { shortUrl } = req.params;
    if (!shortUrl) return next(new AppError('Short URL is required', 400));

    try {
        const url = await Url.findOne({ shortUrl });
        if (!url) return next(new AppError('URL not found', 404));

        url.visits += 1;
        url.lastVisited = new Date();
        await url.save();

        return AppResponse(res, 'URL decoded successfully', 200, {
            longUrl: url.longUrl,
            shortUrl: url.shortUrl,
            urlCode: url.urlCode,
            visits: url.visits,
            createdAt: url.createdAt,
            lastVisited: url.lastVisited
        });
    } catch (error) {
        if (error instanceof mongoose.Error) {
            return next(new AppError('Database error', 500));
        }
        return next(new AppError('Error decoding URL', 500));
    }
});

/**
 * Get statistics for a short URL
 * GET /api/url/statistics/:shortUrl
 */
export const statistics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { shortUrl } = req.params;
    if (!shortUrl) return next(new AppError('Short URL is required', 400));

    try {
        const url = await Url.findOne({ shortUrl });
        if (!url) return next(new AppError('URL not found', 404));

        return AppResponse(res, 'URL statistics retrieved successfully', 200, {
            longUrl: url.longUrl,
            shortUrl: url.shortUrl,
            urlCode: url.urlCode,
            visits: url.visits,
            createdAt: url.createdAt,
            lastVisited: url.lastVisited,
            userAgentCounts: url.userAgentCounts || {},
            referrerCounts: url.referrerCounts || {}
        });
    } catch (error) {
        return next(new AppError('Error retrieving URL statistics', 500));
    }
});

/**
 * Get all URLs
 * GET /api/url/all
 */
export const getAllUrls = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const urls = await Url.find().sort({ createdAt: -1 });
        return AppResponse(res, 'URLs retrieved successfully', 200, urls);
    } catch (error) {
        return next(new AppError('Error retrieving URLs', 500));
    }
});

/**
 * Search URLs
 * GET /api/url/search?query=searchTerm
 */
export const searchUrl = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req.query;

    if (typeof query !== 'string' || query.length < 3) {
        return next(new AppError('Search query must be at least 3 characters long', 400));
    }

    try {
        const urls = await Url.find({
            longUrl: { $regex: query, $options: 'i' }
        }).sort({ createdAt: -1 });

        return AppResponse(res, 'URLs retrieved successfully', 200, urls);
    } catch (error) {
        return next(new AppError('Error searching URLs', 500));
    }
});

/**
 * Redirect from short URL to original URL
 * GET /:shortUrl
 */
export const redirect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { shortUrl } = req.params;
    if (!shortUrl) return next(new AppError('Short URL is required', 400));

    try {
        const url = await Url.findOne({ shortUrl });
        if (!url) return next(new AppError('URL not found', 404));

        // Increment visit count
        url.visits += 1;
        url.lastVisited = new Date();

        // Tracking user agent
        const userAgent = req.headers['user-agent'] || 'Unknown';
        if (!url.userAgentCounts) {
            url.userAgentCounts = {};
        }
        url.userAgentCounts[userAgent] = (url.userAgentCounts[userAgent] || 0) + 1;

        // Tracking referrer
        const referrer = req.headers.referer || 'Direct';
        if (!url.referrerCounts) {
            url.referrerCounts = {};
        }
        url.referrerCounts[referrer] = (url.referrerCounts[referrer] || 0) + 1;

        await url.save();

        return res.redirect(url.longUrl);
    } catch (error) {
        return next(new AppError('Error redirecting to URL', 500));
    }
});
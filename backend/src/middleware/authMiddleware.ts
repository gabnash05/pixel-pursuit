import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token missing' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded;
        next();
    } catch {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// New middleware for admin check
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.isAdmin) { // TODO: does this work?
        return res.status(403).json({ 
            error: 'Forbidden', 
            message: 'Admin access required',
            code: 'ADMIN_ACCESS_REQUIRED'
        });
    }
    next();
};

import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 12;

const prisma = new PrismaClient();

export const generateQrStrings = async (req: Request, res: Response) => {
    const { count = 10, prefix = '', initialPoints = 10 } = req.body;

    if (typeof count !== 'number' || count < 1 || count > 50) {
        return res.status(400).json({ error: 'Invalid count', message: 'Count must be between 1 and 50' });
    }
    if (typeof initialPoints !== 'number' || initialPoints < 1) {
        return res.status(400).json({ error: 'Invalid initialPoints', message: 'initialPoints must be a positive number' });
    }

    const qrStrings: string[] = [];
    const createdCodes = [];
    for (let i = 0; i < count; i++) {
        const random = Math.random().toString(36).substring(2, 12);
        const code = `${prefix}QR_${Date.now()}_${random}`;
        qrStrings.push(code);
        // Save to DB
        const qrCode = await prisma.qRCodes.create({
            data: {
                code,
                initialPoints,
                currPoints: initialPoints,
            },
            select: {
                id: true,
                code: true,
                initialPoints: true,
                currPoints: true,
                createdAt: true,
            }
        });
        createdCodes.push(qrCode);
    }
    res.json({ qrStrings, createdCodes });
};

export const createAdminAccount = async (req: Request, res: Response) => {
    try {
        // 1. Verify super-admin secret (from environment variables)
        const { secret, email, password } = req.body;
        if (secret !== process.env.SUPER_ADMIN_SECRET) {
            return res.status(403).json({ error: 'Invalid super admin secret' });
        }

        // 2. Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({ where: { email } });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Admin already exists' });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // 4. Create admin user
        const admin = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                isAdmin: true
            }
        });

        // 5. Generate JWT token
        const token = jwt.sign(
            { id: admin.id, isAdmin: true },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
        );

        // 6. Return response (excluding password hash)
        const { password: _, ...adminData } = admin;
        res.status(201).json({
            message: 'Admin account created successfully',
            admin: adminData,
            token
        });

    } catch (error) {
        console.error('Error creating admin account:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
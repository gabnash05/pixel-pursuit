import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
    try {
        // Validate request body
        const { email, username, password } = req.body;
        
        if (!email || !username || !password) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Email, username, and password are required'
            });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Password must be at least 8 characters'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: { 
                email: email.toLowerCase().trim(),
                username: username.trim(),
                password: hashedPassword 
            },
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true
            }
        });

        // Generate token
        const token = jwt.sign(
            { userId: user.id }, 
            process.env.JWT_SECRET as string, 
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username
                }
            }
        });

    } catch (error) {
        console.error('Registration Error:', error);

        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                const field = (error.meta as { target?: string[] })?.target?.[0];
                return res.status(409).json({
                    error: 'Conflict',
                    message: `${field} already exists`,
                    details: `The ${field} is already in use`
                });
            }
        }

        // Handle bcrypt errors
        if (error instanceof Error && error.message.includes('bcrypt')) {
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to hash password'
            });
        }

        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to register user',
            details: process.env.NODE_ENV === 'development' 
                ? error instanceof Error ? error.message : String(error)
                : undefined
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        // Validate request body
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
            select: {
                id: true,
                email: true,
                username: true,
                password: true
            }
        });

        // Validate credentials
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid email or password',
                details: 'The provided credentials did not match our records'
            });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id }, 
            process.env.JWT_SECRET as string, 
            { expiresIn: '7d' }
        );

        // Return response without password
        const { password: _, ...userWithoutPassword } = user;

        return res.status(200).json({
            message: 'Login successful',
            data: {
                token,
                user: userWithoutPassword
            }
        });

    } catch (error) {
        console.error('Login Error:', error);

        // Handle JWT errors
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to generate authentication token'
            });
        }

        // Handle bcrypt errors
        if (error instanceof Error && error.message.includes('bcrypt')) {
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to verify password'
            });
        }

        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to process login',
            details: process.env.NODE_ENV === 'development' 
                ? error instanceof Error ? error.message : String(error)
                : undefined
        });
    }
};
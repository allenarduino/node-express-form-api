import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { UserRepository } from '../user/user.repository';
import { createEmailProvider } from '../infrastructure/email';

/**
 * Authentication controller for handling HTTP requests
 */
export class AuthController {
    private authService: AuthService;

    constructor() {
        // Initialize dependencies
        const authRepo = new AuthRepository();
        const userRepo = new UserRepository();
        const emailProvider = createEmailProvider();

        this.authService = new AuthService(authRepo, userRepo, emailProvider);
    }

    /**
     * POST /api/auth/signup
     * Register a new user
     */
    async signUp(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Email and password are required',
                });
                return;
            }

            if (password.length < 6) {
                res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters long',
                });
                return;
            }

            const user = await this.authService.signUp(email, password);

            res.status(201).json({
                success: true,
                message: 'User created successfully. Please check your email for verification.',
                data: {
                    id: user.id,
                    email: user.email,
                },
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: (error as Error).message,
            });
        }
    }

    /**
     * GET /api/auth/verify
     * Verify user's email address
     */
    async verifyEmail(req: Request, res: Response): Promise<void> {
        try {
            const { token } = req.query;

            if (!token || typeof token !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'Verification token is required',
                });
                return;
            }

            const user = await this.authService.verifyEmail(token);

            res.status(200).json({
                success: true,
                message: 'Email verified successfully',
                data: {
                    id: user.id,
                    email: user.email,
                    isEmailVerified: user.isEmailVerified,
                },
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: (error as Error).message,
            });
        }
    }

    /**
     * POST /api/auth/login
     * Authenticate user and return JWT token
     */
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Email and password are required',
                });
                return;
            }

            const result = await this.authService.login(email, password);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    token: result.token,
                },
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: (error as Error).message,
            });
        }
    }

    /**
     * POST /api/auth/verify-token
     * Verify JWT token and return user info
     */
    async verifyToken(req: Request, res: Response): Promise<void> {
        try {
            const { token } = req.body;

            if (!token) {
                res.status(400).json({
                    success: false,
                    message: 'Token is required',
                });
                return;
            }

            const userInfo = await this.authService.verifyToken(token);

            res.status(200).json({
                success: true,
                message: 'Token is valid',
                data: userInfo,
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: (error as Error).message,
            });
        }
    }

    /**
     * POST /api/auth/resend-verification
     * Resend verification email
     */
    async resendVerification(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;

            if (!email) {
                res.status(400).json({
                    success: false,
                    message: 'Email is required',
                });
                return;
            }

            await this.authService.resendVerificationEmail(email);

            res.status(200).json({
                success: true,
                message: 'Verification email sent successfully',
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: (error as Error).message,
            });
        }
    }

    /**
     * GET /api/auth/me
     * Get current user info from JWT token
     */
    async getMe(req: Request, res: Response): Promise<void> {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({
                    success: false,
                    message: 'Authorization header with Bearer token is required',
                });
                return;
            }

            const token = authHeader.substring(7); // Remove 'Bearer ' prefix
            const userInfo = await this.authService.verifyToken(token);

            res.status(200).json({
                success: true,
                message: 'User info retrieved successfully',
                data: userInfo,
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: (error as Error).message,
            });
        }
    }
}

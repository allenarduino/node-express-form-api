import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../presentation/middleware/auth';

/**
 * Authentication routes
 */
export function createAuthRoutes(): Router {
    const router = Router();
    const authController = new AuthController();

    // Bind methods to preserve 'this' context
    const signUp = authController.signUp.bind(authController);
    const verifyEmail = authController.verifyEmail.bind(authController);
    const login = authController.login.bind(authController);
    const verifyToken = authController.verifyToken.bind(authController);
    const resendVerification = authController.resendVerification.bind(authController);
    const getMe = authController.getMe.bind(authController);

    // Public routes
    router.post('/signup', signUp);
    router.get('/verify', verifyEmail);
    router.post('/login', login);
    router.post('/verify-token', verifyToken);
    router.post('/resend-verification', resendVerification);

    // Protected routes
    router.get('/me', authMiddleware, getMe);

    return router;
}

// Export individual route handlers for testing
export { AuthController };

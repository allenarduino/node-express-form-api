import { Router } from 'express';
import { UserController } from './user.controller';
import { authMiddleware } from '../presentation/middleware/auth';

/**
 * User routes for profile management
 */
export function createUserRoutes(): Router {
    const router = Router();
    const userController = new UserController();

    // Bind methods to preserve 'this' context
    const getProfile = userController.getProfile.bind(userController);
    const updateProfile = userController.updateProfile.bind(userController);
    const getUserInfo = userController.getUserInfo.bind(userController);
    const deleteProfile = userController.deleteProfile.bind(userController);
    const getPublicProfile = userController.getPublicProfile.bind(userController);

    // Protected routes (require authentication)
    router.get('/me', authMiddleware, getProfile);
    router.put('/me/profile', authMiddleware, updateProfile);
    router.get('/info', authMiddleware, getUserInfo);
    router.delete('/profile', authMiddleware, deleteProfile);

    // Public routes
    router.get('/profile/:userId', getPublicProfile);

    return router;
}

// Export individual route handlers for testing
export { UserController };

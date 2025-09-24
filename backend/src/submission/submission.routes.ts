import { Router } from 'express';
import { SubmissionController } from './submission.controller';
import { authMiddleware } from '../presentation/middleware/auth';
import { formSubmissionRateLimit, apiRateLimit } from '../middleware/rateLimit';
import { rateLimiters } from '../middleware/enhancedRateLimit';

/**
 * Submission routes
 */
export function createSubmissionRoutes(submissionController?: SubmissionController): Router {
    const router = Router();
    const controller = submissionController || new SubmissionController();

    // Bind methods to preserve 'this' context
    const submitToForm = controller.submitToForm.bind(controller);
    const getSubmissionById = controller.getSubmissionById.bind(controller);
    const getFormSubmissions = controller.getFormSubmissions.bind(controller);
    const getUserSubmissions = controller.getUserSubmissions.bind(controller);
    const updateSubmission = controller.updateSubmission.bind(controller);

    // Public routes (no authentication required)
    // Apply both basic and enhanced rate limiting
    router.post('/forms/:endpointSlug/submit',
        formSubmissionRateLimit,
        rateLimiters.formSpecific.middleware(),
        submitToForm
    );

    // Protected routes (authentication required)
    router.get('/submissions/:id', authMiddleware, apiRateLimit, getSubmissionById);
    router.get('/forms/:formId/submissions', authMiddleware, apiRateLimit, getFormSubmissions);
    router.get('/user/submissions', authMiddleware, apiRateLimit, getUserSubmissions);
    router.put('/submissions/:id', authMiddleware, apiRateLimit, updateSubmission);

    return router;
}

// Export individual route handlers for testing
export { SubmissionController };

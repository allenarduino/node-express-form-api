import { Request, Response } from 'express';
import { SubmissionService } from './submission.service';
import { SubmissionRepository } from './submission.repository';
import { FormRepository } from '../form/form.repository';
import { createSubmissionSchema, submissionQuerySchema } from './submission.validation';

/**
 * Submission controller for handling HTTP requests
 */
export class SubmissionController {
    private submissionService: SubmissionService;

    constructor(submissionService?: SubmissionService) {
        if (submissionService) {
            this.submissionService = submissionService;
        } else {
            // Initialize dependencies for backward compatibility
            const submissionRepo = new SubmissionRepository();
            const formRepo = new FormRepository();
            this.submissionService = new SubmissionService(submissionRepo, formRepo);
        }
    }

    /**
     * POST /api/forms/:endpointSlug/submit
     * Submit data to a form (public endpoint)
     */
    async submitToForm(req: Request, res: Response): Promise<void> {
        try {
            const { endpointSlug } = req.params;

            if (!endpointSlug) {
                res.status(400).json({
                    success: false,
                    message: 'Form endpoint slug is required',
                });
                return;
            }

            // Validate input
            const validationResult = createSubmissionSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationResult.error.issues.map((err: any) => ({
                        field: err.path.join('.'),
                        message: err.message,
                    })),
                });
                return;
            }

            // Get client IP and User-Agent
            const ip = req.ip || req.connection.remoteAddress || 'unknown';
            const userAgent = req.get('User-Agent') || 'unknown';

            const submissionData = validationResult.data;
            const submission = await this.submissionService.submitToForm(
                endpointSlug,
                submissionData,
                ip,
                userAgent
            );

            // Queue background jobs for notifications
            await this.queueBackgroundJobs(submission, endpointSlug);

            res.status(201).json({
                success: true,
                message: 'Form submitted successfully',
                data: {
                    id: submission.id,
                    status: submission.status,
                    submittedAt: submission.createdAt,
                },
            });
        } catch (error) {
            const errorMessage = (error as Error).message;

            // Handle specific error types
            if (errorMessage.includes('not found') || errorMessage.includes('not active')) {
                res.status(404).json({
                    success: false,
                    message: errorMessage,
                });
            } else if (errorMessage.includes('Rate limit') || errorMessage.includes('Spam')) {
                res.status(429).json({
                    success: false,
                    message: errorMessage,
                });
            } else if (errorMessage.includes('required') || errorMessage.includes('must be')) {
                res.status(400).json({
                    success: false,
                    message: errorMessage,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to submit form',
                    error: errorMessage,
                });
            }
        }
    }

    /**
     * GET /api/submissions/:id
     * Get a specific submission by ID (protected)
     */
    async getSubmissionById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Submission ID is required',
                });
                return;
            }

            const submission = await this.submissionService.getById(id);

            if (!submission) {
                res.status(404).json({
                    success: false,
                    message: 'Submission not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Submission retrieved successfully',
                data: {
                    id: submission.id,
                    formId: submission.formId,
                    payload: submission.payload,
                    name: submission.name,
                    email: submission.email,
                    status: submission.status,
                    createdAt: submission.createdAt,
                    updatedAt: submission.updatedAt,
                },
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve submission',
                error: (error as Error).message,
            });
        }
    }

    /**
     * GET /api/forms/:formId/submissions
     * Get all submissions for a specific form (protected)
     */
    async getFormSubmissions(req: Request, res: Response): Promise<void> {
        try {
            const { formId } = req.params;

            if (!formId) {
                res.status(400).json({
                    success: false,
                    message: 'Form ID is required',
                });
                return;
            }

            // Validate query parameters
            const queryResult = submissionQuerySchema.safeParse(req.query);
            if (!queryResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid query parameters',
                    errors: queryResult.error.issues.map((err: any) => ({
                        field: err.path.join('.'),
                        message: err.message,
                    })),
                });
                return;
            }

            const { page = 1, limit = 10 } = queryResult.data;
            const result = await this.submissionService.getByFormId(formId, page, limit);

            res.status(200).json({
                success: true,
                message: 'Form submissions retrieved successfully',
                data: {
                    submissions: result.submissions.map(submission => ({
                        id: submission.id,
                        payload: submission.payload,
                        name: submission.name,
                        email: submission.email,
                        status: submission.status,
                        createdAt: submission.createdAt,
                        updatedAt: submission.updatedAt,
                    })),
                    pagination: {
                        page,
                        limit,
                        total: result.total,
                        totalPages: result.totalPages,
                    },
                },
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve form submissions',
                error: (error as Error).message,
            });
        }
    }

    /**
     * GET /api/user/submissions
     * Get all submissions for the current user (protected)
     */
    async getUserSubmissions(req: Request, res: Response): Promise<void> {
        try {
            // Get user ID from authenticated request
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
                return;
            }

            // Validate query parameters
            const queryResult = submissionQuerySchema.safeParse(req.query);
            if (!queryResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid query parameters',
                    errors: queryResult.error.issues.map((err: any) => ({
                        field: err.path.join('.'),
                        message: err.message,
                    })),
                });
                return;
            }

            const { page = 1, limit = 10 } = queryResult.data;
            const result = await this.submissionService.getByUserId(userId, page, limit);

            res.status(200).json({
                success: true,
                message: 'User submissions retrieved successfully',
                data: {
                    submissions: result.submissions.map(submission => ({
                        id: submission.id,
                        formId: submission.formId,
                        payload: submission.payload,
                        name: submission.name,
                        email: submission.email,
                        status: submission.status,
                        createdAt: submission.createdAt,
                        updatedAt: submission.updatedAt,
                    })),
                    pagination: {
                        page,
                        limit,
                        total: result.total,
                        totalPages: result.totalPages,
                    },
                },
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve user submissions',
                error: (error as Error).message,
            });
        }
    }

    /**
     * PUT /api/submissions/:id
     * Update a submission status (protected)
     */
    async updateSubmission(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Submission ID is required',
                });
                return;
            }

            // Get user ID from authenticated request
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
                return;
            }

            const { status } = req.body;

            if (!status || !['new', 'read', 'responded'].includes(status)) {
                res.status(400).json({
                    success: false,
                    message: 'Valid status is required (new, read, responded)',
                });
                return;
            }

            const submission = await this.submissionService.update(id, { status });

            res.status(200).json({
                success: true,
                message: 'Submission updated successfully',
                data: {
                    id: submission.id,
                    status: submission.status,
                    updatedAt: submission.updatedAt,
                },
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to update submission',
                error: (error as Error).message,
            });
        }
    }

    /**
     * Queue background jobs for notifications
     * @param submission - The submission
     * @param endpointSlug - The form endpoint slug
     */
    private async queueBackgroundJobs(submission: any, endpointSlug: string): Promise<void> {
        try {
            // Get form details for notifications
            const formRepo = new FormRepository();
            const form = await formRepo.findByEndpointSlug(endpointSlug);

            if (form) {
                // Queue email notification
                await this.submissionService.queueEmailNotification(submission, form);

                // Queue webhook
                await this.submissionService.queueWebhook(submission, form);
            }
        } catch (error) {
            // Log error but don't fail the submission
            console.error('Failed to queue background jobs:', error);
        }
    }
}

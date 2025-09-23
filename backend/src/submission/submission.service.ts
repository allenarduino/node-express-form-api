import { SubmissionRepository } from './submission.repository';
import { FormRepository } from '../form/form.repository';
import { Submission, Form } from '@prisma/client';
import { CreateSubmissionInput, FormSettings } from './submission.validation';
import { jobQueue } from '../jobs';

/**
 * Submission service for business logic operations
 */
export class SubmissionService {
    constructor(
        private submissionRepo: SubmissionRepository,
        private formRepo: FormRepository
    ) { }

    /**
     * Create a new submission
     * @param data - Submission creation data
     * @param ip - Client IP address
     * @param userAgent - Client user agent
     * @returns Promise<Submission> - The created submission
     * @throws Error if validation fails or spam detected
     */
    async createSubmission(
        data: CreateSubmissionInput,
        ip: string,
        userAgent: string
    ): Promise<Submission> {
        // Get form by endpoint slug (assuming we have the slug from the route)
        // This will be called from the controller with the form context

        // Validate submission data against form fields
        await this.validateSubmissionData(data);

        // Check for spam
        await this.checkSpamProtection(data, ip);

        // Create submission
        const submission = await this.submissionRepo.create({
            formId: '', // Will be set by controller
            payload: data.formData,
            name: data.name,
            email: data.email,
            ip,
            userAgent,
            status: 'new',
        });

        return submission;
    }

    /**
     * Create submission for a specific form
     * @param formSlug - The form's endpoint slug
     * @param data - Submission data
     * @param ip - Client IP address
     * @param userAgent - Client user agent
     * @returns Promise<Submission> - The created submission
     */
    async submitToForm(
        formSlug: string,
        data: CreateSubmissionInput,
        ip: string,
        userAgent: string
    ): Promise<Submission> {
        // Get form by endpoint slug
        const form = await this.formRepo.findByEndpointSlug(formSlug);
        if (!form) {
            throw new Error('Form not found');
        }

        if (!form.isActive) {
            throw new Error('Form is not active');
        }

        // Validate submission data against form fields
        await this.validateSubmissionData(data, form.settings as FormSettings);

        // Check for spam
        await this.checkSpamProtection(data, ip, form.settings as FormSettings);

        // Check if multiple submissions are allowed
        if (!this.allowMultipleSubmissions(form.settings as FormSettings)) {
            const recentSubmissions = await this.submissionRepo.getRecentSubmissionsByIp(ip, 60); // 1 hour
            if (recentSubmissions.length > 0) {
                throw new Error('Multiple submissions not allowed');
            }
        }

        // Create submission
        const submission = await this.submissionRepo.create({
            formId: form.id,
            payload: data.formData,
            name: data.name,
            email: data.email,
            ip,
            userAgent,
            status: 'new',
        });

        return submission;
    }

    /**
     * Get a submission by ID
     * @param id - The submission ID
     * @returns Promise<Submission | null> - The submission if found, null otherwise
     */
    async getById(id: string): Promise<Submission | null> {
        return this.submissionRepo.findById(id);
    }

    /**
     * Get submissions for a form
     * @param formId - The form ID
     * @param page - Page number (1-based)
     * @param limit - Number of items per page
     * @returns Promise<{ submissions: Submission[]; total: number; totalPages: number }> - Paginated results
     */
    async getByFormId(formId: string, page: number = 1, limit: number = 10): Promise<{
        submissions: Submission[];
        total: number;
        totalPages: number;
    }> {
        return this.submissionRepo.findByFormId(formId, page, limit);
    }

    /**
     * Get submissions for a user
     * @param userId - The user ID
     * @param page - Page number (1-based)
     * @param limit - Number of items per page
     * @returns Promise<{ submissions: Submission[]; total: number; totalPages: number }> - Paginated results
     */
    async getByUserId(userId: string, page: number = 1, limit: number = 10): Promise<{
        submissions: Submission[];
        total: number;
        totalPages: number;
    }> {
        return this.submissionRepo.findByUserId(userId, page, limit);
    }

    /**
     * Update a submission
     * @param id - The submission ID to update
     * @param data - Partial submission data to update
     * @returns Promise<Submission> - The updated submission
     */
    async update(id: string, data: Partial<{
        status: string;
        payload: any;
    }>): Promise<Submission> {
        return this.submissionRepo.update(id, data);
    }

    /**
     * Delete a submission
     * @param id - The submission ID to delete
     * @returns Promise<Submission> - The deleted submission
     */
    async delete(id: string): Promise<Submission> {
        return this.submissionRepo.delete(id);
    }

    /**
     * Validate submission data against form fields
     * @param data - Submission data
     * @param settings - Form settings (optional)
     */
    private async validateSubmissionData(data: CreateSubmissionInput, settings?: FormSettings): Promise<void> {
        // Basic validation
        if (!data.formData || typeof data.formData !== 'object') {
            throw new Error('Form data is required');
        }

        // If form has defined fields, validate against them
        if (settings?.fields) {
            for (const field of settings.fields) {
                const value = data.formData[field.id];

                // Check required fields
                if (field.required && (!value || value === '')) {
                    throw new Error(`Field '${field.label}' is required`);
                }

                // Validate field types
                if (value && field.type === 'email' && typeof value === 'string') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        throw new Error(`Field '${field.label}' must be a valid email`);
                    }
                }

                if (value && field.type === 'number' && typeof value !== 'number') {
                    throw new Error(`Field '${field.label}' must be a number`);
                }
            }
        }
    }

    /**
     * Check for spam protection
     * @param data - Submission data
     * @param ip - Client IP address
     * @param settings - Form settings (optional)
     */
    private async checkSpamProtection(data: CreateSubmissionInput, ip: string, settings?: FormSettings): Promise<void> {
        const spamProtection = settings?.spamProtection;

        if (!spamProtection?.enabled) {
            return;
        }

        // Check honeypot field
        if (spamProtection.honeypot && data.honeypot) {
            throw new Error('Spam detected');
        }

        // Check rate limiting
        if (spamProtection.rateLimit) {
            const recentSubmissions = await this.submissionRepo.getRecentSubmissionsByIp(ip, 1); // 1 minute
            if (recentSubmissions.length >= spamProtection.rateLimit) {
                throw new Error('Rate limit exceeded');
            }
        }
    }

    /**
     * Check if multiple submissions are allowed
     * @param settings - Form settings
     * @returns boolean - True if multiple submissions are allowed
     */
    private allowMultipleSubmissions(settings?: FormSettings): boolean {
        return settings?.allowMultipleSubmissions || false;
    }

    /**
     * Queue email notification job
     * @param submission - The submission
     * @param form - The form
     */
    async queueEmailNotification(submission: Submission, form: Form): Promise<void> {
        const settings = form.settings as FormSettings;

        if (!settings?.requireEmailNotification || !settings?.notificationEmail) {
            return;
        }

        await jobQueue.queueEmailNotification(submission, form, settings.notificationEmail);
    }

    /**
     * Queue webhook job
     * @param submission - The submission
     * @param form - The form
     */
    async queueWebhook(submission: Submission, form: Form): Promise<void> {
        const settings = form.settings as FormSettings;

        // Check if webhook URL is configured in settings
        if (settings?.webhookUrl) {
            await jobQueue.queueWebhook(submission, form, settings.webhookUrl, settings.webhookSecret);
        }
    }
}

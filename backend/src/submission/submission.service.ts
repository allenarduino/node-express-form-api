import { SubmissionRepository } from './submission.repository';
import { FormRepository } from '../form/form.repository';
import { Submission, Form } from '@prisma/client';
import { CreateSubmissionInput, FormSettings } from './submission.validation';
import { addEmailJob, addWebhookJob, addAutoReplyEmailJob } from '../queue/queueConfig';
import { SpamProtectionService, SpamProtectionConfig } from '../services/spamProtectionService';

/**
 * Submission service for business logic operations
 */
export class SubmissionService {
    private spamProtectionService: SpamProtectionService;

    constructor(
        private submissionRepo: SubmissionRepository,
        private formRepo: FormRepository
    ) {
        this.spamProtectionService = new SpamProtectionService();
    }

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

        // Check for spam (no formId available in createSubmission)
        // await this.checkSpamProtection(data, ip, '', undefined);

        // Create submission
        const submission = await this.submissionRepo.create({
            formId: '', // Will be set by controller
            payload: data.formData,
            ...(data.formData.name && { name: data.formData.name }),
            ...(data.formData.email && { email: data.formData.email }),
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
        await this.checkSpamProtection(data, ip, form.id, form.settings as FormSettings);

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
            ...(data.formData.name && { name: data.formData.name }),
            ...(data.formData.email && { email: data.formData.email }),
            ip,
            userAgent,
            status: 'new',
        });

        // Queue email notification if enabled
        const settings = form.settings as FormSettings;
        if (settings?.requireEmailNotification && settings?.notificationEmail) {
            await this.queueEmailNotification(submission, form);
        }

        // Queue auto-reply email if submitter provided email
        if (data.formData.email) {
            await this.queueAutoReplyEmail(submission, form);
        }

        // Queue webhook if configured
        if (settings?.webhookUrl) {
            await this.queueWebhook(submission, form);
        }

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
     * Bulk delete submissions
     * @param ids - Array of submission IDs to delete
     * @returns Promise<number> - Number of deleted submissions
     */
    async bulkDelete(ids: string[]): Promise<number> {
        return this.submissionRepo.bulkDelete(ids);
    }

    /**
     * Mark submissions as spam
     * @param ids - Array of submission IDs to mark as spam
     * @returns Promise<number> - Number of updated submissions
     */
    async markAsSpam(ids: string[]): Promise<number> {
        return this.submissionRepo.bulkUpdateStatus(ids, 'spam');
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
     * Check for spam protection using comprehensive spam protection service
     * @param data - Submission data
     * @param ip - Client IP address
     * @param formId - Form ID
     * @param settings - Form settings (optional)
     */
    private async checkSpamProtection(data: CreateSubmissionInput, ip: string, formId: string, settings?: FormSettings): Promise<void> {
        const spamProtection = settings?.spamProtection;

        if (!spamProtection?.enabled) {
            return;
        }

        // Prepare spam protection configuration
        const spamConfig: SpamProtectionConfig = {
            ...(spamProtection.honeypot && { honeypotField: 'honeypot' }),
            enableRecaptcha: spamProtection.enabled && !!process.env.RECAPTCHA_SECRET_KEY,
            ...(process.env.RECAPTCHA_SECRET_KEY && { recaptchaSecret: process.env.RECAPTCHA_SECRET_KEY }),
            rateLimitPerIp: spamProtection.rateLimit || 10,
            rateLimitPerForm: 50, // Default form limit
            rateLimitWindow: 60, // 1 hour
        };

        // Perform comprehensive spam check
        const spamCheck = await this.spamProtectionService.performSpamCheck(
            data.formData,
            ip,
            formId,
            spamConfig
        );

        if (!spamCheck.isValid) {
            throw new Error(`Spam protection: ${spamCheck.reason}`);
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

        try {
            await addEmailJob({
                submissionId: submission.id,
                formId: form.id,
                notificationEmail: settings.notificationEmail,
                submissionData: submission,
                formData: form,
            });
            console.log(`Email notification job queued for submission ${submission.id}`);
        } catch (error) {
            console.error(`Failed to queue email notification for submission ${submission.id}:`, error);
        }
    }

    /**
     * Queue auto-reply email job
     * @param submission - The submission
     * @param form - The form
     */
    async queueAutoReplyEmail(submission: Submission, form: Form): Promise<void> {
        if (!submission.email) {
            return;
        }

        try {
            await addAutoReplyEmailJob({
                submissionId: submission.id,
                formId: form.id,
                submitterEmail: submission.email,
                submissionData: submission,
                formData: form,
            });
            console.log(`Auto-reply email job queued for submission ${submission.id}`);
        } catch (error) {
            console.error(`Failed to queue auto-reply email for submission ${submission.id}:`, error);
        }
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
            try {
                await addWebhookJob({
                    submissionId: submission.id,
                    formId: form.id,
                    webhookUrl: settings.webhookUrl,
                    ...(settings.webhookSecret && { webhookSecret: settings.webhookSecret }),
                    submissionData: submission,
                    formData: form,
                });
                console.log(`Webhook job queued for submission ${submission.id}`);
            } catch (error) {
                console.error(`Failed to queue webhook for submission ${submission.id}:`, error);
            }
        }
    }
}

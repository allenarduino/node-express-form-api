import { FormRepository } from './form.repository';
import { Form } from '@prisma/client';

/**
 * Form service for business logic operations
 */
export class FormService {
    constructor(private formRepo: FormRepository) { }

    /**
     * Create a new form
     * @param data - Form creation data
     * @param userId - ID of the user creating the form
     * @returns Promise<Form> - The created form
     * @throws Error if creation fails
     */
    async create(data: {
        name: string;
        description?: string;
        endpointSlug: string;
        settings?: any;
    }, userId: string): Promise<Form> {
        // Check if endpoint slug is available
        const isSlugAvailable = await this.formRepo.isEndpointSlugAvailable(data.endpointSlug);
        if (!isSlugAvailable) {
            throw new Error('Endpoint slug is already taken');
        }

        try {
            return await this.formRepo.create({
                ...data,
                userId,
            });
        } catch (error) {
            throw new Error('Failed to create form');
        }
    }

    /**
     * Get a form by ID
     * @param id - The form ID
     * @returns Promise<Form | null> - The form if found, null otherwise
     */
    async getById(id: string): Promise<Form | null> {
        return this.formRepo.findById(id);
    }

    /**
     * Get a form by its endpoint slug (public access)
     * @param endpointSlug - The endpoint slug
     * @returns Promise<Form | null> - The form if found and active, null otherwise
     */
    async getByEndpointSlug(endpointSlug: string): Promise<Form | null> {
        const form = await this.formRepo.findByEndpointSlug(endpointSlug);

        if (!form || !form.isActive) {
            return null;
        }

        return form;
    }

    /**
     * Get all forms for a user
     * @param userId - The user ID
     * @returns Promise<Form[]> - Array of user's forms
     */
    async getByUserId(userId: string): Promise<Form[]> {
        return this.formRepo.findByUserId(userId);
    }

    /**
     * Get all forms with pagination
     * @param page - Page number (1-based)
     * @param limit - Number of items per page
     * @returns Promise<{ forms: Form[]; total: number; totalPages: number }> - Paginated results
     */
    async getAll(page: number = 1, limit: number = 10): Promise<{
        forms: Form[];
        total: number;
        totalPages: number;
    }> {
        return this.formRepo.findAll(page, limit);
    }

    /**
     * Update a form
     * @param id - The form ID to update
     * @param data - Partial form data to update
     * @param userId - ID of the user requesting the update
     * @returns Promise<Form> - The updated form
     * @throws Error if form not found or user not authorized
     */
    async update(id: string, data: Partial<{
        name: string;
        description: string;
        endpointSlug: string;
        settings: any;
        isActive: boolean;
    }>, userId: string): Promise<Form> {
        // Check if form exists
        const form = await this.formRepo.findById(id);
        if (!form) {
            throw new Error('Form not found');
        }

        // Check if user owns the form
        const isOwner = await this.formRepo.isOwner(id, userId);
        if (!isOwner) {
            throw new Error('You are not authorized to update this form');
        }

        // If endpoint slug is being updated, check if it's available
        if (data.endpointSlug && data.endpointSlug !== form.endpointSlug) {
            const isSlugAvailable = await this.formRepo.isEndpointSlugAvailable(data.endpointSlug, id);
            if (!isSlugAvailable) {
                throw new Error('Endpoint slug is already taken');
            }
        }

        try {
            return await this.formRepo.update(id, data);
        } catch (error) {
            throw new Error('Failed to update form');
        }
    }

    /**
     * Delete a form
     * @param id - The form ID to delete
     * @param userId - ID of the user requesting the deletion
     * @returns Promise<Form> - The deleted form
     * @throws Error if form not found or user not authorized
     */
    async delete(id: string, userId: string): Promise<Form> {
        // Check if form exists
        const form = await this.formRepo.findById(id);
        if (!form) {
            throw new Error('Form not found');
        }

        // Check if user owns the form
        const isOwner = await this.formRepo.isOwner(id, userId);
        if (!isOwner) {
            throw new Error('You are not authorized to delete this form');
        }

        try {
            return await this.formRepo.delete(id);
        } catch (error) {
            throw new Error('Failed to delete form');
        }
    }

    /**
     * Check if a user owns a form
     * @param formId - The form ID to check
     * @param userId - The user ID to check ownership
     * @returns Promise<boolean> - True if user owns the form, false otherwise
     */
    async isOwner(formId: string, userId: string): Promise<boolean> {
        return this.formRepo.isOwner(formId, userId);
    }

    /**
     * Generate form endpoint URL
     * @param endpointSlug - The form's endpoint slug
     * @returns string - The form endpoint URL
     */
    getFormEndpointUrl(endpointSlug: string): string {
        return `/api/forms/${endpointSlug}/submit`;
    }

    /**
     * Generate a unique endpoint slug from a name
     * @param name - The form name
     * @param userId - The user ID for uniqueness
     * @returns Promise<string> - A unique endpoint slug
     */
    async generateUniqueEndpointSlug(name: string, userId: string): Promise<string> {
        // Convert name to slug format
        let baseSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        if (!baseSlug) {
            baseSlug = 'form';
        }

        // Check if base slug is available
        let slug = baseSlug;
        let counter = 1;

        while (!(await this.formRepo.isEndpointSlugAvailable(slug))) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        return slug;
    }
}


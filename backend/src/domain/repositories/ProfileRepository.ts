import { PrismaClient, Profile } from '@prisma/client';
import { prisma } from '../../config/prisma';

/**
 * Repository class for Profile entity operations
 * Provides a clean interface over Prisma Profile operations
 */
export class ProfileRepository {
    private prisma: PrismaClient;

    constructor(prismaClient?: PrismaClient) {
        this.prisma = prismaClient || prisma;
    }

    /**
     * Create an empty profile for a user
     * @param userId - The user ID to create profile for
     * @returns Promise<Profile> - The created profile
     */
    async create(userId: string): Promise<Profile> {
        return this.prisma.profile.create({
            data: {
                userId,
                name: null,
                bio: null,
                avatarUrl: null,
                website: null,
            },
        });
    }

    /**
     * Find a profile by user ID
     * @param userId - The user ID to search for
     * @returns Promise<Profile | null> - The profile if found, null otherwise
     */
    async findByUserId(userId: string): Promise<Profile | null> {
        return this.prisma.profile.findUnique({
            where: { userId },
        });
    }

    /**
     * Update a profile with the provided data
     * @param userId - The user ID whose profile to update
     * @param data - Partial profile data to update
     * @returns Promise<Profile> - The updated profile
     */
    async update(userId: string, data: Partial<Profile>): Promise<Profile> {
        return this.prisma.profile.update({
            where: { userId },
            data,
        });
    }

    /**
     * Create or update a profile (upsert operation)
     * @param userId - The user ID for the profile
     * @param data - Profile data to create or update
     * @returns Promise<Profile> - The created or updated profile
     */
    async upsert(userId: string, data: Partial<Profile>): Promise<Profile> {
        return this.prisma.profile.upsert({
            where: { userId },
            create: {
                userId,
                name: data.name || null,
                bio: data.bio || null,
                avatarUrl: data.avatarUrl || null,
                website: data.website || null,
            },
            update: data,
        });
    }

    /**
     * Delete a profile by user ID
     * @param userId - The user ID whose profile to delete
     * @returns Promise<Profile> - The deleted profile
     */
    async delete(userId: string): Promise<Profile> {
        return this.prisma.profile.delete({
            where: { userId },
        });
    }

    /**
     * Check if a profile exists for a user
     * @param userId - The user ID to check
     * @returns Promise<boolean> - True if profile exists, false otherwise
     */
    async existsByUserId(userId: string): Promise<boolean> {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            select: { id: true },
        });
        return profile !== null;
    }

    /**
     * Get all profiles with pagination
     * @param skip - Number of records to skip
     * @param take - Number of records to take
     * @returns Promise<Profile[]> - Array of profiles
     */
    async findAll(skip: number = 0, take: number = 10): Promise<Profile[]> {
        return this.prisma.profile.findMany({
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get profile with user information
     * @param userId - The user ID to get profile for
     * @returns Promise<Profile & { user: User } | null> - Profile with user data
     */
    async findByUserIdWithUser(userId: string): Promise<(Profile & { user: any }) | null> {
        return this.prisma.profile.findUnique({
            where: { userId },
            include: {
                user: true,
            },
        });
    }
}

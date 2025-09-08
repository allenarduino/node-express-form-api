import { PrismaClient, User, Profile } from '@prisma/client';
import { prisma } from '../config/prisma';

/**
 * User repository for user and profile operations
 * Handles user profile and public data queries
 */
export class UserRepository {
    private prisma: PrismaClient;

    constructor(prismaClient?: PrismaClient) {
        this.prisma = prismaClient || prisma;
    }

    /**
     * Get user with profile data
     * @param userId - The user ID to get data for
     * @returns Promise<User & { profile: Profile | null } | null> - User with profile
     */
    async findUserWithProfile(userId: string): Promise<(User & { profile: Profile | null }) | null> {
        return this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
            },
        });
    }

    /**
     * Get user basic info without profile
     * @param userId - The user ID to get info for
     * @returns Promise<{ id: string; email: string; isEmailVerified: boolean } | null> - Basic user info
     */
    async findUserBasicInfo(userId: string): Promise<{ id: string; email: string; isEmailVerified: boolean } | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                isEmailVerified: true,
            },
        });
        return user;
    }

    /**
     * Create a new profile for a user
     * @param userId - The user ID to create profile for
     * @returns Promise<Profile> - The created profile
     */
    async createProfile(userId: string): Promise<Profile> {
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
    async findProfileByUserId(userId: string): Promise<Profile | null> {
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
    async updateProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
        return this.prisma.profile.update({
            where: { userId },
            data,
        });
    }

    /**
     * Check if a profile exists for a user
     * @param userId - The user ID to check
     * @returns Promise<boolean> - True if profile exists, false otherwise
     */
    async profileExists(userId: string): Promise<boolean> {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            select: { id: true },
        });
        return profile !== null;
    }

    /**
     * Get public profile data (without sensitive user info)
     * @param userId - The user ID to get public profile for
     * @returns Promise<{ id: string; profile: Profile } | null> - Public profile data
     */
    async findPublicProfile(userId: string): Promise<{ id: string; profile: Profile } | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                profile: true,
            },
        });

        if (!user || !user.profile) {
            return null;
        }

        return {
            id: user.id,
            profile: user.profile,
        };
    }

    /**
     * Clear profile data (soft delete)
     * @param userId - The user ID whose profile to clear
     * @returns Promise<Profile> - The updated profile
     */
    async clearProfile(userId: string): Promise<Profile> {
        return this.prisma.profile.update({
            where: { userId },
            data: {
                name: null,
                bio: null,
                avatarUrl: null,
                website: null,
            },
        });
    }

    /**
     * Get all profiles with pagination
     * @param skip - Number of records to skip
     * @param take - Number of records to take
     * @returns Promise<Profile[]> - Array of profiles
     */
    async findAllProfiles(skip: number = 0, take: number = 10): Promise<Profile[]> {
        return this.prisma.profile.findMany({
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Search profiles by name or bio
     * @param searchTerm - The term to search for
     * @param skip - Number of records to skip
     * @param take - Number of records to take
     * @returns Promise<Profile[]> - Array of matching profiles
     */
    async searchProfiles(searchTerm: string, skip: number = 0, take: number = 10): Promise<Profile[]> {
        return this.prisma.profile.findMany({
            where: {
                OR: [
                    { name: { contains: searchTerm } },
                    { bio: { contains: searchTerm } },
                ],
            },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        });
    }
}

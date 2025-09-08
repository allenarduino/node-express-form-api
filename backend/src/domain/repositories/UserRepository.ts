import { PrismaClient, User } from '@prisma/client';
import { prisma } from '../../config/prisma';

/**
 * Repository class for User entity operations
 * Provides a clean interface over Prisma User operations
 */
export class UserRepository {
    private prisma: PrismaClient;

    constructor(prismaClient?: PrismaClient) {
        this.prisma = prismaClient || prisma;
    }

    /**
     * Create a new user with the provided data
     * @param data - User creation data including email and passwordHash
     * @returns Promise<User> - The created user
     */
    async create(data: {
        email: string;
        passwordHash: string;
        isEmailVerified?: boolean;
        verificationToken?: string;
        verificationTokenExpires?: Date;
    }): Promise<User> {
        return this.prisma.user.create({
            data: {
                email: data.email,
                passwordHash: data.passwordHash,
                isEmailVerified: data.isEmailVerified || false,
                verificationToken: data.verificationToken || null,
                verificationTokenExpires: data.verificationTokenExpires || null,
            },
        });
    }

    /**
     * Find a user by their email address
     * @param email - The email address to search for
     * @returns Promise<User | null> - The user if found, null otherwise
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    /**
     * Find a user by their unique ID
     * @param id - The user ID to search for
     * @returns Promise<User | null> - The user if found, null otherwise
     */
    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    /**
     * Find a user by their email verification token
     * @param token - The verification token to search for
     * @returns Promise<User | null> - The user if found, null otherwise
     */
    async findByVerificationToken(token: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: { verificationToken: token },
        });
    }

    /**
     * Update a user with the provided data
     * @param id - The user ID to update
     * @param data - Partial user data to update
     * @returns Promise<User> - The updated user
     */
    async update(id: string, data: Partial<User>): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete a user by their ID
     * @param id - The user ID to delete
     * @returns Promise<User> - The deleted user
     */
    async delete(id: string): Promise<User> {
        return this.prisma.user.delete({
            where: { id },
        });
    }

    /**
     * Check if a user exists by email
     * @param email - The email address to check
     * @returns Promise<boolean> - True if user exists, false otherwise
     */
    async existsByEmail(email: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });
        return user !== null;
    }

    /**
     * Get all users with pagination
     * @param skip - Number of records to skip
     * @param take - Number of records to take
     * @returns Promise<User[]> - Array of users
     */
    async findAll(skip: number = 0, take: number = 10): Promise<User[]> {
        return this.prisma.user.findMany({
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        });
    }
}

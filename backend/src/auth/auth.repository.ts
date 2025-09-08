import { PrismaClient, User } from '@prisma/client';
import { prisma } from '../config/prisma';

/**
 * Authentication repository for user authentication operations
 * Handles auth-specific database queries
 */
export class AuthRepository {
    private prisma: PrismaClient;

    constructor(prismaClient?: PrismaClient) {
        this.prisma = prismaClient || prisma;
    }

    /**
     * Create a new user with authentication data
     * @param data - User creation data including email and passwordHash
     * @returns Promise<User> - The created user
     */
    async createUser(data: {
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
    async updateUser(id: string, data: Partial<User>): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    /**
     * Check if a user exists by email
     * @param email - The email address to check
     * @returns Promise<boolean> - True if user exists, false otherwise
     */
    async userExistsByEmail(email: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });
        return user !== null;
    }

    /**
     * Update user's email verification status
     * @param id - The user ID to update
     * @param isVerified - Whether the email is verified
     * @returns Promise<User> - The updated user
     */
    async updateEmailVerification(id: string, isVerified: boolean): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data: {
                isEmailVerified: isVerified,
                verificationToken: null,
                verificationTokenExpires: null,
            },
        });
    }

    /**
     * Update user's verification token
     * @param id - The user ID to update
     * @param token - The new verification token
     * @param expires - The token expiration date
     * @returns Promise<User> - The updated user
     */
    async updateVerificationToken(
        id: string,
        token: string,
        expires: Date
    ): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data: {
                verificationToken: token,
                verificationTokenExpires: expires,
            },
        });
    }
}

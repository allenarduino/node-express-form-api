// Export all repository classes
export { UserRepository } from './UserRepository';
export { ProfileRepository } from './ProfileRepository';

// Example usage:
/*
import { UserRepository, ProfileRepository } from './domain/repositories';
import { prisma } from '../config/prisma';

// Initialize repositories
const userRepo = new UserRepository();
const profileRepo = new ProfileRepository();

// Or with custom Prisma client
const customUserRepo = new UserRepository(prisma);

// User operations
const user = await userRepo.create({
  email: 'user@example.com',
  passwordHash: 'hashed_password',
  isEmailVerified: false,
});

const foundUser = await userRepo.findByEmail('user@example.com');
const userById = await userRepo.findById(user.id);

// Profile operations
const profile = await profileRepo.create(user.id);
const userProfile = await profileRepo.findByUserId(user.id);

// Update operations
const updatedUser = await userRepo.update(user.id, {
  isEmailVerified: true,
});

const updatedProfile = await profileRepo.update(user.id, {
  name: 'John Doe',
  bio: 'Software developer',
});
*/

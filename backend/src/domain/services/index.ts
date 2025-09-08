// Export all service classes
export { AuthService } from './AuthService';

// Example usage:
/*
import { AuthService } from './domain/services';
import { UserRepository, ProfileRepository } from './domain/repositories';
import { createEmailProvider } from './infrastructure/email';

// Initialize dependencies
const userRepo = new UserRepository();
const profileRepo = new ProfileRepository();
const emailProvider = createEmailProvider();

// Create AuthService instance
const authService = new AuthService(userRepo, profileRepo, emailProvider);

// User registration
try {
  const user = await authService.signUp('user@example.com', 'password123');
  console.log('User created:', user);
} catch (error) {
  console.error('Registration failed:', error.message);
}

// Email verification
try {
  const verifiedUser = await authService.verifyEmail('verification-token-here');
  console.log('Email verified:', verifiedUser);
} catch (error) {
  console.error('Verification failed:', error.message);
}

// User login
try {
  const loginResult = await authService.login('user@example.com', 'password123');
  console.log('Login successful, token:', loginResult.token);
} catch (error) {
  console.error('Login failed:', error.message);
}

// Token verification
try {
  const userInfo = await authService.verifyToken('jwt-token-here');
  console.log('Token valid, user:', userInfo);
} catch (error) {
  console.error('Token verification failed:', error.message);
}

// Resend verification email
try {
  await authService.resendVerificationEmail('user@example.com');
  console.log('Verification email sent');
} catch (error) {
  console.error('Resend failed:', error.message);
}
*/

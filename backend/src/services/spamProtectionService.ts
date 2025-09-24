import axios from 'axios';
import { env } from '../config/env';

/**
 * Spam protection configuration interface
 */
export interface SpamProtectionConfig {
    honeypotField?: string;
    enableRecaptcha?: boolean;
    recaptchaSecret?: string;
    rateLimitPerIp?: number;
    rateLimitPerForm?: number;
    rateLimitWindow?: number; // in minutes
}

/**
 * reCAPTCHA verification response
 */
interface RecaptchaResponse {
    success: boolean;
    'error-codes'?: string[];
    challenge_ts?: string;
    hostname?: string;
}

/**
 * Rate limiting data structure
 */
interface RateLimitData {
    count: number;
    resetTime: number;
}

/**
 * SpamProtectionService for handling various spam protection mechanisms
 */
export class SpamProtectionService {
    private rateLimitStore: Map<string, RateLimitData> = new Map();

    /**
     * Validate honeypot field
     * @param payload - Submission payload
     * @param honeypotField - Name of the honeypot field (default: 'website')
     * @returns boolean - true if valid (honeypot is empty), false if spam
     */
    validateHoneypot(payload: Record<string, any>, honeypotField: string = 'website'): boolean {
        // Honeypot should be empty or contain only whitespace
        const honeypotValue = payload[honeypotField];
        return !honeypotValue || (typeof honeypotValue === 'string' && honeypotValue.trim() === '');
    }

    /**
     * Verify Google reCAPTCHA token
     * @param token - reCAPTCHA token from frontend
     * @param secret - reCAPTCHA secret key
     * @param remoteIp - Client's IP address
     * @returns Promise<boolean> - true if valid, false if invalid
     */
    async verifyRecaptcha(token: string, secret: string, remoteIp?: string): Promise<boolean> {
        if (!token || !secret) {
            return false;
        }

        try {
            const response = await axios.post<RecaptchaResponse>(
                'https://www.google.com/recaptcha/api/siteverify',
                new URLSearchParams({
                    secret,
                    response: token,
                    ...(remoteIp && { remoteip: remoteIp }),
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    timeout: 10000, // 10 second timeout
                }
            );

            const { success, 'error-codes': errorCodes } = response.data;

            if (!success) {
                console.warn('reCAPTCHA verification failed:', errorCodes);
                return false;
            }

            return true;
        } catch (error) {
            console.error('reCAPTCHA verification error:', error);
            return false;
        }
    }

    /**
     * Check rate limiting for IP address
     * @param ip - Client IP address
     * @param limit - Maximum requests per window
     * @param windowMinutes - Time window in minutes
     * @returns boolean - true if within limit, false if rate limited
     */
    checkRateLimitByIp(ip: string, limit: number = 10, windowMinutes: number = 60): boolean {
        const key = `ip:${ip}`;
        return this.checkRateLimit(key, limit, windowMinutes);
    }

    /**
     * Check rate limiting for form
     * @param formId - Form ID
     * @param limit - Maximum requests per window
     * @param windowMinutes - Time window in minutes
     * @returns boolean - true if within limit, false if rate limited
     */
    checkRateLimitByForm(formId: string, limit: number = 50, windowMinutes: number = 60): boolean {
        const key = `form:${formId}`;
        return this.checkRateLimit(key, limit, windowMinutes);
    }

    /**
     * Check rate limiting for IP + Form combination
     * @param ip - Client IP address
     * @param formId - Form ID
     * @param limit - Maximum requests per window
     * @param windowMinutes - Time window in minutes
     * @returns boolean - true if within limit, false if rate limited
     */
    checkRateLimitByIpAndForm(ip: string, formId: string, limit: number = 5, windowMinutes: number = 60): boolean {
        const key = `ip_form:${ip}:${formId}`;
        return this.checkRateLimit(key, limit, windowMinutes);
    }

    /**
     * Generic rate limiting check
     * @param key - Unique key for rate limiting
     * @param limit - Maximum requests per window
     * @param windowMinutes - Time window in minutes
     * @returns boolean - true if within limit, false if rate limited
     */
    private checkRateLimit(key: string, limit: number, windowMinutes: number): boolean {
        const now = Date.now();
        const windowMs = windowMinutes * 60 * 1000;
        const resetTime = now + windowMs;

        const existing = this.rateLimitStore.get(key);

        if (!existing) {
            // First request
            this.rateLimitStore.set(key, { count: 1, resetTime });
            return true;
        }

        if (now > existing.resetTime) {
            // Window has expired, reset
            this.rateLimitStore.set(key, { count: 1, resetTime });
            return true;
        }

        if (existing.count >= limit) {
            // Rate limit exceeded
            return false;
        }

        // Increment count
        existing.count++;
        this.rateLimitStore.set(key, existing);
        return true;
    }

    /**
     * Clean up expired rate limit entries
     */
    cleanupExpiredEntries(): void {
        const now = Date.now();
        for (const [key, data] of this.rateLimitStore.entries()) {
            if (now > data.resetTime) {
                this.rateLimitStore.delete(key);
            }
        }
    }

    /**
     * Get rate limit status for a key
     * @param key - Rate limit key
     * @returns Rate limit status or null if not found
     */
    getRateLimitStatus(key: string): { count: number; resetTime: number; remaining: number } | null {
        const data = this.rateLimitStore.get(key);
        if (!data) {
            return null;
        }

        const now = Date.now();
        if (now > data.resetTime) {
            return null; // Expired
        }

        return {
            count: data.count,
            resetTime: data.resetTime,
            remaining: Math.max(0, data.resetTime - now),
        };
    }

    /**
     * Comprehensive spam check
     * @param payload - Submission payload
     * @param ip - Client IP address
     * @param formId - Form ID
     * @param config - Spam protection configuration
     * @returns Promise<{ isValid: boolean; reason?: string }>
     */
    async performSpamCheck(
        payload: Record<string, any>,
        ip: string,
        formId: string,
        config: SpamProtectionConfig
    ): Promise<{ isValid: boolean; reason?: string }> {
        // 1. Honeypot check
        if (config.honeypotField) {
            if (!this.validateHoneypot(payload, config.honeypotField)) {
                return { isValid: false, reason: 'Honeypot field filled - likely spam' };
            }
        }

        // 2. Rate limiting checks
        if (config.rateLimitPerIp) {
            if (!this.checkRateLimitByIp(ip, config.rateLimitPerIp, config.rateLimitWindow)) {
                return { isValid: false, reason: 'IP rate limit exceeded' };
            }
        }

        if (config.rateLimitPerForm) {
            if (!this.checkRateLimitByForm(formId, config.rateLimitPerForm, config.rateLimitWindow)) {
                return { isValid: false, reason: 'Form rate limit exceeded' };
            }
        }

        // Check IP + Form combination (more restrictive)
        const ipFormLimit = Math.min(config.rateLimitPerIp || 10, config.rateLimitPerForm || 50) || 5;
        if (!this.checkRateLimitByIpAndForm(ip, formId, ipFormLimit, config.rateLimitWindow)) {
            return { isValid: false, reason: 'IP + Form rate limit exceeded' };
        }

        // 3. reCAPTCHA verification
        if (config.enableRecaptcha && config.recaptchaSecret) {
            const recaptchaToken = payload.recaptcha_token || payload['g-recaptcha-response'];
            if (!recaptchaToken) {
                return { isValid: false, reason: 'reCAPTCHA token required' };
            }

            const isRecaptchaValid = await this.verifyRecaptcha(recaptchaToken, config.recaptchaSecret, ip);
            if (!isRecaptchaValid) {
                return { isValid: false, reason: 'reCAPTCHA verification failed' };
            }
        }

        return { isValid: true };
    }

    /**
     * Get default spam protection configuration
     * @returns Default configuration
     */
    getDefaultConfig(): SpamProtectionConfig {
        return {
            honeypotField: 'website',
            enableRecaptcha: false,
            ...(env.RECAPTCHA_SECRET_KEY && { recaptchaSecret: env.RECAPTCHA_SECRET_KEY }),
            rateLimitPerIp: 10,
            rateLimitPerForm: 50,
            rateLimitWindow: 60, // 1 hour
        };
    }
}

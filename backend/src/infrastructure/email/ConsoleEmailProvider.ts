import { EmailProvider, EmailData, ExtendedEmailProvider } from './EmailProvider';

/**
 * Console email provider for development and testing
 * Logs email content to console instead of actually sending
 */
export class ConsoleEmailProvider implements ExtendedEmailProvider {
    private readonly prefix: string;

    constructor(prefix: string = '[EMAIL]') {
        this.prefix = prefix;
    }

    /**
     * Send an email by logging it to console
     * @param to - Email address of the recipient
     * @param subject - Subject line of the email
     * @param html - HTML content of the email
     * @returns Promise<void> - Resolves immediately after logging
     */
    async send(to: string, subject: string, html: string): Promise<void> {
        console.log('\n' + '='.repeat(60));
        console.log(`${this.prefix} EMAIL SENT`);
        console.log('='.repeat(60));
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('---');
        console.log('HTML Content:');
        console.log(html);
        console.log('---');
        console.log('='.repeat(60) + '\n');
    }

    /**
     * Send an email with extended options by logging to console
     * @param data - Email data with additional options
     * @returns Promise<void> - Resolves immediately after logging
     */
    async sendExtended(data: EmailData): Promise<void> {
        console.log('\n' + '='.repeat(60));
        console.log(`${this.prefix} EMAIL SENT (EXTENDED)`);
        console.log('='.repeat(60));
        console.log(`To: ${data.to}`);
        console.log(`From: ${data.from || 'default'}`);
        console.log(`Subject: ${data.subject}`);
        console.log('---');

        if (data.text) {
            console.log('Text Content:');
            console.log(data.text);
            console.log('---');
        }

        console.log('HTML Content:');
        console.log(data.html);
        console.log('---');
        console.log('='.repeat(60) + '\n');
    }

    /**
     * Get the current prefix for console output
     * @returns string - The current prefix
     */
    getPrefix(): string {
        return this.prefix;
    }

    /**
     * Set a new prefix for console output
     * @param prefix - New prefix to use
     */
    setPrefix(prefix: string): void {
        (this as any).prefix = prefix;
    }
}

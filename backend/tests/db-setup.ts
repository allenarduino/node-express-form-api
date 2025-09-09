import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

// Generate Prisma client for test database
export const setupTestDatabase = async (): Promise<void> => {
    try {
        // Generate Prisma client for test database
        execSync('npx prisma generate --schema=prisma/test-schema.prisma', {
            stdio: 'inherit',
            env: {
                ...process.env,
                TEST_DATABASE_URL: 'file:./test.db',
            },
        });

        // Push the schema to create the test database
        execSync('npx prisma db push --schema=prisma/test-schema.prisma', {
            stdio: 'inherit',
            env: {
                ...process.env,
                TEST_DATABASE_URL: 'file:./test.db',
            },
        });

        console.log('✅ Test database setup completed');
    } catch (error) {
        console.error('❌ Test database setup failed:', error);
        throw error;
    }
};

// Clean up test database
export const cleanupTestDatabase = async (): Promise<void> => {
    try {
        const prisma = new PrismaClient({
            datasources: {
                db: {
                    url: 'file:./test.db',
                },
            },
        });

        await prisma.profile.deleteMany();
        await prisma.user.deleteMany();
        await prisma.$disconnect();

        console.log('✅ Test database cleaned up');
    } catch (error) {
        console.error('❌ Test database cleanup failed:', error);
    }
};

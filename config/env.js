const { z } = require('zod');

// Environment schema validation with Zod
const envSchema = z.object({
    // Node Environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Server Configuration
    PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),

    // JWT Configuration
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for security'),

    // Database Configuration
    DATABASE_PROVIDER: z.enum(['postgresql', 'mysql']).default('mysql'),
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string'),

    // Optional: Separate database credentials (for constructing DATABASE_URL)
    DB_HOST: z.string().optional(),
    DB_PORT: z.string().transform(Number).pipe(z.number().positive()).optional(),
    DB_USER: z.string().optional(),
    DB_PASSWORD: z.string().optional(),
    DB_NAME: z.string().optional(),
});

// Parse and validate environment variables
function validateEnv() {
    try {
        const env = envSchema.parse(process.env);
        console.log('✅ Environment variables validated successfully');
        console.log(`   - Environment: ${env.NODE_ENV}`);
        console.log(`   - Database Provider: ${env.DATABASE_PROVIDER}`);
        console.log(`   - Port: ${env.PORT}`);
        return env;
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Environment variable validation failed:');
            error.errors.forEach((err) => {
                console.error(`   - ${err.path.join('.')}: ${err.message}`);
            });
            process.exit(1);
        }
        throw error;
    }
}

// Export validated environment
const env = validateEnv();

module.exports = { env, validateEnv };

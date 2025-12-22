import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
    try {
        console.log('--- Probing Database ---');

        // Test connection
        await prisma.$connect();
        console.log('✅ Connected to database successfully');

        // Check templates
        const templateCount = await prisma.template.count();
        console.log(`📊 Number of templates in database: ${templateCount}`);

        // Check ChatSessions
        try {
            const chatCount = await prisma.chatSession.count();
            console.log(`💬 Number of chat sessions: ${chatCount}`);
        } catch (err: any) {
            console.error('❌ Failed to count ChatSessions. Table might be missing.');
        }

        // List all tables
        const tables = await prisma.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;
        console.log('🏗️ Tables in public schema:', JSON.stringify(tables, null, 2));

        if (templateCount === 0) {
            console.log('⚠️ No templates found in the database. Seeding might be required.');
        } else {
            const templates = await prisma.template.findMany({
                take: 3,
                select: { id: true, name: true, category: true }
            });
            console.log('📋 First few templates:', JSON.stringify(templates, null, 2));
        }

        // Check users as a baseline
        const userCount = await prisma.user.count();
        console.log(`👥 Number of users in database: ${userCount}`);

    } catch (error) {
        console.error('❌ Database check failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();

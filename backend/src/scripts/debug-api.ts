import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function debug() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log('No API KEY found');
        return;
    }

    // Mask key for safety in logs, show first 4 chars
    console.log('Using Key:', apiKey.substring(0, 4) + '...');

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.log('HTTP ERROR:', response.status, response.statusText);
            console.log('Error Details:', JSON.stringify(data, null, 2));
        } else {
            console.log('SUCCESS! Models found:', (data as any).models?.length);
            const models = (data as any).models || [];
            models.filter((m: any) => m.name.includes('gemini') && (m.name.includes('flash') || m.name.includes('pro')))
                .forEach((m: any) => console.log(' - ' + m.name));
        }
    } catch (e: any) {
        console.log('FETCH FAILED:', e.message);
    }
}

debug();

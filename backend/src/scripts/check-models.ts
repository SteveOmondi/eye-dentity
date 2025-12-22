import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function check() {
    console.log('Checking gemini-1.5-flash...');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log('NO_KEY');
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const res = await model.generateContent('Hi');
        console.log('SUCCESS: ' + res.response.text().substring(0, 20));
    } catch (e: any) {
        console.log('ERROR: ' + e.message);
    }
}
check();

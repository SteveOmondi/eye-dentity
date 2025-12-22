
import { sendMessage, type Message } from '../src/services/llm-provider.service';

async function testChatFlow() {
    console.log('🚀 Starting Chat Service AI Latency Test (Simulated)\n');

    try {
        // 1. Simulate History
        // We simulate a chat history where the assistant asked for profession
        const messages: Message[] = [
            { role: 'assistant', content: "Hi! I'm here to help you build your website. What is your profession?" }
        ];

        // 2. Simulate User Response
        const userMessage = "I am a freelance photographer based in New York.";
        console.log(`2️⃣ User sending: "${userMessage}"`);

        messages.push({ role: 'user', content: userMessage });

        const msgStartTime = Date.now();
        console.log('Calling sendMessage (Gemini)...');

        const systemPrompt = `You are a friendly and professional AI assistant helping users build their professional website.`;

        // Use 'gemini' as provider
        const response = await sendMessage('gemini', messages, systemPrompt);

        const duration = Date.now() - msgStartTime;

        console.log(`✅ AI responded`);
        console.log(`⏱️ Duration: ${duration}ms`);
        console.log(`🤖 AI: ${response.substring(0, 100)}...`);

    } catch (error: any) {
        console.error('❌ Error during chat test:', error);
    }
}

testChatFlow();

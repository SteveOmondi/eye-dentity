import fs from 'fs/promises';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { sendMessage } from './llm-provider.service';
import { ProfileData } from './content-generator.service';

export class ProfileDiscoveryService {
    /**
     * Extract text from a file (PDF, Docx, or Txt)
     */
    async extractTextFromFile(filePath: string, mimetype: string): Promise<string> {
        try {
            const buffer = await fs.readFile(filePath);

            if (mimetype === 'application/pdf') {
                const data = await pdf(buffer);
                return data.text;
            } else if (
                mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                mimetype === 'application/msword'
            ) {
                const result = await mammoth.extractRawText({ buffer });
                return result.value;
            } else if (mimetype === 'text/plain') {
                return buffer.toString('utf-8');
            }

            throw new Error(`Unsupported mimetype for text extraction: ${mimetype}`);
        } catch (error) {
            console.error('Error extracting text from file:', error);
            throw new Error('Failed to extract text from profile file');
        }
    }

    /**
     * Parse extracted text into structured ProfileData using AI
     */
    async parseProfileData(text: string, provider: 'claude' | 'openai' | 'gemini' = 'gemini'): Promise<Partial<ProfileData>> {
        const systemPrompt = `You are an expert profile analyzer. Your task is to extract structured professional information from the provided text (which could be a resume, bio, or profile).
    
    Extract the following fields in JSON format:
    - name: Full name
    - email: Primary email
    - profession: A concise professional title (e.g., "Senior Software Engineer", "Graphic Designer")
    - phone: Contact number
    - companyName: Current or most significant company
    - tagline: A brief, punchy professional mantra or value proposition (max 10 words)
    - bio: A professional biography (approx 2-3 paragraphs)
    - services: Array of specific services or skills offered
    - yearsOfExperience: Numeric value of years in industry
    - location: City/City, Country
    - languages: Array of languages spoken
    
    If a field is not found, leave it as null or an empty array.
    Ensure the output is valid JSON.`;

        const userMessage = `Extract profile data from the following text:\n\n${text.substring(0, 10000)}`; // Limit text length

        try {
            const response = await sendMessage(provider, [{ role: 'user', content: userMessage }], systemPrompt);

            // Try to parse JSON from response
            let parsedData: any = {};
            try {
                parsedData = JSON.parse(response);
            } catch (e) {
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsedData = JSON.parse(jsonMatch[0]);
                }
            }

            return {
                name: parsedData.name || '',
                email: parsedData.email || '',
                profession: parsedData.profession || '',
                phone: parsedData.phone || '',
                bio: parsedData.bio || '',
                services: Array.isArray(parsedData.services) ? parsedData.services : [],
                location: parsedData.location || '',
                // Add other fields that match ProfileData or FormData
                ...parsedData
            };
        } catch (error) {
            console.error('Error parsing profile data with AI:', error);
            throw new Error('AI extraction failed');
        }
    }
}

export default new ProfileDiscoveryService();

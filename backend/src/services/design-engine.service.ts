import { sendMessage } from './llm-provider.service';

export interface IntentSchema {
    productType: 'saas' | 'dashboard' | 'marketplace' | 'consumer';
    audience: 'enterprise' | 'prosumer' | 'consumer';
    brandTone: string[];
    visualDensity: 'low' | 'medium' | 'high';
    motionLevel: 'none' | 'subtle' | 'expressive';
    platform: 'web' | 'mobile' | 'responsive';
    accessibility: 'standard' | 'high';
    riskTolerance: 'safe' | 'experimental';
}

export interface DesignGenome {
    contrastBias: number;
    roundness: number;
    whitespacePreference: number;
    fontModernity: number;
    motionTolerance: number;
    seed: string;
}

export interface DesignTokens {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
    };
    typography: {
        headingFont: string;
        bodyFont: string;
        baseSize: number;
        scale: number;
    };
    spacing: {
        base: number;
        multipliers: number[];
    };
    borderRadius: string;
    shadows: string[];
}

export interface SemanticLayoutGraph {
    page: string;
    sections: Array<{
        type: string;
        priority: number;
        props?: Record<string, any>;
    }>;
}

export class DesignEngineService {
    /**
     * Extract intent from user input using AI
     */
    async understandIntent(input: string): Promise<IntentSchema> {
        const prompt = `You are a Senior Product Strategist. Extract design intent from this request: "${input}"
    
    Return ONLY valid JSON:
    {
      "productType": "saas | dashboard | marketplace | consumer",
      "audience": "enterprise | prosumer | consumer",
      "brandTone": ["modern", "minimal", "premium", "playful"],
      "visualDensity": "low | medium | high",
      "motionLevel": "none | subtle | expressive",
      "platform": "web | mobile | responsive",
      "accessibility": "standard | high",
      "riskTolerance": "safe | experimental"
    }`;

        const response = await sendMessage('gemini', [{ role: 'user', content: prompt }], 'Extract design intent.');
        return JSON.parse(response);
    }

    /**
     * Initialize a new genome based on a seed
     */
    initializeGenome(seed: string): DesignGenome {
        // Deterministic pseudo-random generation based on seed
        const hash = this.stringToHash(seed);
        const rng = this.createRNG(hash);

        return {
            contrastBias: rng(),
            roundness: rng(),
            whitespacePreference: rng(),
            fontModernity: rng(),
            motionTolerance: rng(),
            seed
        };
    }

    /**
     * Mutate genome based on feedback
     */
    mutateGenome(genome: DesignGenome, delta: Partial<DesignGenome>): DesignGenome {
        return {
            ...genome,
            ...delta
        };
    }

    /**
     * Generate design tokens from intent and genome
     */
    async generateTokens(intent: IntentSchema, genome: DesignGenome): Promise<DesignTokens> {
        // Deterministic token generation influenced by genome
        const prompt = `Generate design tokens based on this intent and design genome.
    Intent: ${JSON.stringify(intent)}
    Genome: ${JSON.stringify(genome)}
    
    Return ONLY valid JSON for DesignTokens schema.
    Ensure accessibility contrast is strictly followed.`;

        const response = await sendMessage('gemini', [{ role: 'user', content: prompt }], 'Generate design tokens.');
        return JSON.parse(response);
    }

    /**
     * Generate layout graph based on intent
     */
    async generateLayoutGraph(intent: IntentSchema): Promise<SemanticLayoutGraph> {
        const prompt = `Generate a semantic layout graph for a ${intent.productType} directed at ${intent.audience}.
    Density: ${intent.visualDensity}
    
    Return ONLY valid JSON for SemanticLayoutGraph schema index.`;

        const response = await sendMessage('gemini', [{ role: 'user', content: prompt }], 'Generate layout graph.');
        return JSON.parse(response);
    }

    private stringToHash(s: string): number {
        let hash = 0;
        for (let i = 0; i < s.length; i++) {
            hash = (hash << 5) - hash + s.charCodeAt(i);
            hash |= 0;
        }
        return hash;
    }

    private createRNG(seed: number) {
        let state = seed;
        return () => {
            state = (state * 1664525 + 1013904223) | 0;
            return (state >>> 0) / 4294967296;
        };
    }
}

export default new DesignEngineService();

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useFormStore } from '../store/formStore';
import { API_BASE_URL } from '../api/client';

export const PreviewStep = ({ onSuggestChanges }: { onSuggestChanges: (feedback: string) => void }) => {
    const { formData } = useFormStore();
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [previewCss, setPreviewCss] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [feedback, setFeedback] = useState('');
    const [isIterating, setIsIterating] = useState(false);

    const fetchPreview = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/websites/preview`, {
                profileData: {
                    name: formData.name,
                    profession: formData.profession,
                    bio: formData.bio,
                    services: formData.services,
                    email: formData.email,
                    phone: formData.phone,
                    location: formData.location
                },
                templateId: formData.selectedTemplate,
                colorScheme: formData.selectedColorScheme || formData.colorScheme,
                useAIDesign: formData.useAIDesign
            });

            setPreviewHtml(response.data.html);
            setPreviewCss(response.data.css);
        } catch (err) {
            console.error('Failed to fetch preview:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPreview();
    }, []);

    const handleSuggest = async () => {
        if (!feedback.trim()) return;
        setIsIterating(true);
        // For preview iteration, we just re-fetch the preview with a hint?
        // In this MVP, we simulate it by just showing we received feedback and re-generating
        console.log('User feedback for preview:', feedback);
        await fetchPreview(); // Simple re-gen for now
        setFeedback('');
        setIsIterating(false);
        onSuggestChanges(feedback);
    };

    // Construct data URL for iframe
    const getIframeSrc = () => {
        if (!previewHtml) return '';
        const fullHtml = `
      <html>
        <head>
          <style>${previewCss}</style>
          <style>
            body { margin: 0; padding: 0; overflow-x: hidden; }
            * { transition: all 0.3s ease; }
          </style>
        </head>
        <body>${previewHtml}</body>
      </html>
    `;
        return `data:text/html;charset=utf-8,${encodeURIComponent(fullHtml)}`;
    };

    return (
        <div className="w-full h-full flex flex-col gap-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                        Website <span className="text-wizard-accent">Preview</span>
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mt-2">
                        A live look at your professional presence
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-3 py-1 bg-wizard-accent/10 border border-wizard-accent/20 rounded-lg flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-wizard-accent animate-pulse" />
                        <span className="text-[8px] font-black text-wizard-accent uppercase tracking-widest text-ellipsis">Live Preview</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-[500px] rounded-[2.5rem] bg-white/[0.01] border border-white/5 relative overflow-hidden group shadow-2xl">
                {isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#0d0d0d]/80 backdrop-blur-sm z-20">
                        <div className="w-16 h-16 border-4 border-wizard-accent/10 border-t-wizard-accent rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">
                            Donald is designing your site...
                        </p>
                    </div>
                ) : (
                    <iframe
                        src={getIframeSrc()}
                        className="w-full h-full border-none scale-100 origin-top"
                        title="Website Preview"
                    />
                )}
            </div>

            {/* Iteration Box */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-wizard-accent/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-wizard-accent/10 transition-all" />

                <div className="relative z-10">
                    <h4 className="text-[10px] font-black text-wizard-accent uppercase tracking-[0.3em] mb-4">
                        Request a Change
                    </h4>
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Suggest changes (e.g. 'Make it more professional', 'Add a neon glow to the header')"
                            className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-wizard-accent/50 transition-all font-medium"
                        />
                        <button
                            onClick={handleSuggest}
                            disabled={isIterating || !feedback.trim()}
                            className="px-8 py-4 bg-white/5 hover:bg-wizard-accent hover:text-black border border-white/10 hover:border-wizard-accent rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            {isIterating ? 'Refining...' : 'Apply Suggestion'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

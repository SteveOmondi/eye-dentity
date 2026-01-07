import { useState, useRef } from 'react';
import axios from 'axios';
import { useFormStore } from '../store/formStore';
import { API_BASE_URL } from '../api/client';

export const IdentityUplinkStep = ({ onComplete }: { onComplete: () => void }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { updateFormData } = useFormStore();

    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('provider', 'gemini');

        try {
            const response = await axios.post(`${API_BASE_URL}/api/upload/resume`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const { profileData } = response.data;

            // Update form store with absolute data
            updateFormData({
                ...profileData,
                // Ensure lists are actual arrays
                services: Array.isArray(profileData.services) ? profileData.services : [],
                languages: Array.isArray(profileData.languages) ? profileData.languages : [],
            });

            onComplete();
        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.response?.data?.error || 'Failed to parse resume. Try manually.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">
                    Resume <span className="text-wizard-accent">Import</span>
                </h2>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">
                    Upload your resume and Donald will build your profile for you
                </p>
            </div>

            <div
                className={`relative group rounded-[2.5rem] border-2 border-dashed transition-all duration-500 overflow-hidden ${dragActive
                    ? 'border-wizard-accent bg-wizard-accent/5 scale-[1.02]'
                    : 'border-white/10 hover:border-wizard-accent/30 bg-white/[0.02]'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="p-16 flex flex-col items-center justify-center text-center">
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-20 h-20 border-4 border-wizard-accent/10 border-t-wizard-accent rounded-full animate-spin" />
                            <div className="space-y-2">
                                <p className="text-sm font-black text-white uppercase tracking-widest animate-pulse">
                                    Reading your CV...
                                </p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                                    Donald is processing your details
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="w-24 h-24 bg-wizard-accent/10 border border-wizard-accent/20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(196,240,66,0.1)]">
                                <svg className="w-10 h-10 text-wizard-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                    Drop your Resume here
                                </h3>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    PDF, DOCX, or TXT (Max 10MB)
                                </p>

                                <div className="pt-6">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-8 py-4 bg-wizard-accent text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(196,240,66,0.3)]"
                                    >
                                        Select File
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".pdf,.docx,.doc,.txt"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Ambient Glows */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-wizard-accent/5 blur-[60px]" />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-wizard-purple/5 blur-[60px]" />
            </div>

            {error && (
                <div className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">
                        Uplink Failed: {error}
                    </p>
                </div>
            )}

            <div className="mt-12 text-center">
                <button
                    onClick={() => onComplete()}
                    className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
                >
                    Or skip and enter manually
                </button>
            </div>
        </div>
    );
};

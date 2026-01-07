import { useState, useRef } from 'react';
import axios from 'axios';
import { useFormStore } from '../store/formStore';
import { API_BASE_URL } from '../api/client';

interface ProfileUplinkButtonProps {
    onSuccess?: (data: any) => void;
    compact?: boolean;
}

export const ProfileUplinkButton = ({ onSuccess, compact = false }: ProfileUplinkButtonProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
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

            const sanitizedData = {
                ...profileData,
                services: Array.isArray(profileData.services) ? profileData.services : [],
                languages: Array.isArray(profileData.languages) ? profileData.languages : [],
            };

            updateFormData(sanitizedData);
            if (onSuccess) onSuccess(sanitizedData);
        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.response?.data?.error || 'Failed to parse resume');
        } finally {
            setIsUploading(false);
        }
    };

    if (compact) {
        return (
            <div className="relative group">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    title="Uplink Resume"
                    className="w-12 h-12 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center text-wizard-accent hover:bg-wizard-accent hover:text-black transition-all disabled:opacity-50"
                >
                    {isUploading ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <div className="w-6 h-6 rounded-lg overflow-hidden border border-wizard-accent/30 group-hover:border-wizard-accent transition-colors">
                            <img src="/donald.png" alt="" className="w-full h-full object-cover" />
                        </div>
                    )}
                </button>
                {error && (
                    <div className="absolute bottom-full mb-4 right-0 w-48 bg-red-500/90 text-white text-[8px] font-black uppercase tracking-widest p-2 rounded-lg text-center shadow-xl animate-fade-in">
                        {error}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="w-full">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.docx,.doc,.txt"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full group relative overflow-hidden bg-wizard-accent/5 border border-wizard-accent/20 hover:border-wizard-accent/50 p-6 rounded-[2rem] transition-all duration-500 hover:bg-wizard-accent/[0.08]"
            >
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-12 h-12 bg-wizard-accent/10 border border-wizard-accent/20 rounded-xl flex items-center justify-center text-wizard-accent group-hover:scale-110 transition-transform overflow-hidden p-1.5">
                        {isUploading ? (
                            <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <img src="/donald.png" alt="Donald" className="w-full h-full object-cover rounded-lg" />
                        )}
                    </div>
                    <div className="text-left">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest group-hover:text-wizard-accent transition-colors">
                            {isUploading ? 'Reading your resume...' : 'Import from Resume'}
                        </h4>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                            {isUploading ? 'Donald is processing your career details' : 'Donald will automatically build your profile from your CV'}
                        </p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-wizard-accent/5 blur-[40px] -mr-16 -mt-16 group-hover:bg-wizard-accent/10 transition-all" />
            </button>
            {error && (
                <p className="mt-4 text-center text-red-500 text-[9px] font-black uppercase tracking-widest">
                    Uplink Error: {error}
                </p>
            )}
        </div>
    );
};

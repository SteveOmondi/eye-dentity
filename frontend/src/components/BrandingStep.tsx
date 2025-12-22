import { useState, useRef } from 'react';
import { useFormStore } from '../store/formStore';
import { uploadApi } from '../api/upload';

export const BrandingStep = () => {

  const { formData, updateFormData } = useFormStore();

  // Separate states for logo
  const [logoPreview, setLogoPreview] = useState<string>(formData.logoUrl || '');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Separate states for profile photo
  const [photoPreview, setPhotoPreview] = useState<string>(formData.profilePhotoUrl || '');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.';
    }
    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5MB';
    }
    return null;
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setLogoError(error);
      return;
    }

    setLogoError('');
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);

    setLogoUploading(true);
    try {
      const response = await uploadApi.uploadLogo(file);
      updateFormData({ logoUrl: response.url });
    } catch (err) {
      setLogoError('Failed to upload logo. Please try again.');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleProfilePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setPhotoError(error);
      return;
    }

    setPhotoError('');
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);

    setPhotoUploading(true);
    try {
      const response = await uploadApi.uploadProfilePhoto(file);
      updateFormData({ profilePhotoUrl: response.url });
    } catch (err) {
      setPhotoError('Failed to upload photo. Please try again.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    updateFormData({ logoUrl: '' });
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    updateFormData({ profilePhotoUrl: '' });
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  return (
    <div className="p-0 animate-fade-up">
      <div className="mb-12">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Visual <span className="text-wizard-accent">Architecture</span></h2>
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
          Initialize your visual identity by uploading core assets. High-resolution imagery is recommended.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Business Logo Section */}
        <div className="space-y-8">
          <div className="px-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent/80 mb-2">Corporate Insignia</h3>
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
              Projected logo for the digital interface
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-wizard-accent/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative glass-card border border-white/5 rounded-3xl p-10 overflow-hidden">
              {!logoPreview ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-white/[0.03] border border-white/5 rounded-2xl mx-auto flex items-center justify-center mb-8 group-hover:border-wizard-accent/30 transition-colors">
                    <svg className="h-10 w-10 text-gray-600 group-hover:text-wizard-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center px-8 py-4 bg-wizard-accent text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(196,240,66,0.1)]">
                    <span>Initiate Upload</span>
                    <input id="logo-upload" name="logo-upload" type="file" className="sr-only" ref={logoInputRef} accept="image/*" onChange={handleLogoSelect} />
                  </label>
                  <p className="mt-6 text-[8px] uppercase tracking-[0.3em] text-gray-600 font-black">SUPPORTED: PNG, JPG, WEBP (MAX 5MB)</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="relative w-48 h-48 mx-auto group/preview">
                    <div className="absolute inset-0 bg-wizard-accent/5 rounded-2xl animate-pulse" />
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain relative z-10 p-4" />
                    {logoUploading && (
                      <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                        <div className="w-10 h-10 border-2 border-wizard-accent border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <button onClick={handleRemoveLogo} className="text-gray-500 hover:text-red-500 text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
                      Eject Asset
                    </button>
                  </div>
                </div>
              )}
              {logoError && <p className="text-red-500 text-[9px] mt-4 text-center font-black uppercase tracking-widest">{logoError}</p>}
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-wizard-accent mb-4">Optimization Specs:</h4>
            <div className="space-y-3">
              {[
                { label: 'Aspect Ratio', value: '1:1 Square' },
                { label: 'Background', value: 'Transparent Alpha' },
                { label: 'Resolution', value: '512px Minimum' }
              ].map((spec, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">{spec.label}</span>
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Photo Section */}
        <div className="space-y-8">
          <div className="px-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent/80 mb-2">Biometric Data (Photo)</h3>
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
              Professional portrait for neural rendering
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-wizard-purple/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative glass-card border border-white/5 rounded-3xl p-10 overflow-hidden">
              {!photoPreview ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-white/[0.03] border border-white/5 rounded-full mx-auto flex items-center justify-center mb-8 group-hover:border-wizard-purple/30 transition-colors">
                    <svg className="h-10 w-10 text-gray-600 group-hover:text-wizard-purple transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <label htmlFor="photo-upload" className="cursor-pointer inline-flex items-center px-8 py-4 bg-wizard-purple text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white hover:text-black hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                    <span>Choice Photo</span>
                    <input id="photo-upload" name="photo-upload" type="file" className="sr-only" ref={photoInputRef} accept="image/*" onChange={handleProfilePhotoSelect} />
                  </label>
                  <p className="mt-6 text-[8px] uppercase tracking-[0.3em] text-gray-600 font-black">HIGH FIDELITY PORTRAIT RECOMMENDED</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="relative w-48 h-48 mx-auto">
                    <div className="absolute inset-0 bg-wizard-purple/10 rounded-full animate-pulse blur-lg" />
                    <img src={photoPreview} alt="Profile preview" className="w-full h-full object-cover rounded-full border border-white/10 relative z-10" />
                    {photoUploading && (
                      <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-full">
                        <div className="w-10 h-10 border-2 border-wizard-purple border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <button onClick={handleRemovePhoto} className="text-gray-500 hover:text-red-500 text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
                      Eject Portrait
                    </button>
                  </div>
                </div>
              )}
              {photoError && <p className="text-red-500 text-[9px] mt-4 text-center font-black uppercase tracking-widest">{photoError}</p>}
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-wizard-purple mb-4">Aesthetic Standards:</h4>
            <div className="space-y-3">
              {[
                { label: 'Lighting', value: 'High Contrast' },
                { label: 'Expression', value: 'Professional' },
                { label: 'Focus', value: 'Sharp Detail' }
              ].map((spec, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">{spec.label}</span>
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Color Palette Section */}
        <div className="md:col-span-2 space-y-8 pt-8 border-t border-white/5">
          <div className="px-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent/80 mb-2">Chromatic Signature</h3>
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
              Select the primary spectral frequency for your interface
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { id: 'default', name: 'Azure', color: '#2563eb' },
              { id: 'navy', name: 'Deep Sea', color: '#1e3a8a' },
              { id: 'emerald', name: 'Forest', color: '#059669' },
              { id: 'purple', name: 'Royal', color: '#7c3aed' },
              { id: 'crimson', name: 'Ruby', color: '#dc2626' },
              { id: 'slate', name: 'Graphite', color: '#475569' }
            ].map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => updateFormData({ colorScheme: scheme.id })}
                className={`
                  group relative p-4 rounded-2xl border transition-all duration-300
                  ${formData.colorScheme === scheme.id
                    ? 'bg-white/[0.05] border-wizard-accent/50 scale-105 shadow-[0_0_20px_rgba(196,240,66,0.1)]'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'}
                `}
              >
                <div
                  className="w-full aspect-video rounded-lg mb-3 shadow-lg"
                  style={{ backgroundColor: scheme.color }}
                />
                <div className="text-center">
                  <span className={`
                    text-[9px] font-black uppercase tracking-widest
                    ${formData.colorScheme === scheme.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}
                  `}>
                    {scheme.name}
                  </span>
                </div>
                {formData.colorScheme === scheme.id && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-wizard-accent shadow-[0_0_10px_#C4F042]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


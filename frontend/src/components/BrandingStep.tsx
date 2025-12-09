import { useState, useRef } from 'react';
import { useFormStore } from '../store/formStore';
import { uploadApi } from '../api/upload';



export const BrandingStep = () => {
  const { formData, updateFormData, setCurrentStep } = useFormStore();

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
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.';
    }

    // Validate file size (5MB)
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

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setLogoUploading(true);
    try {
      const response = await uploadApi.uploadLogo(file);
      updateFormData({
        logoFile: file,
        logoUrl: response.url,
      });
    } catch (err) {
      setLogoError('Failed to upload logo. Please try again.');
      console.error('Upload error:', err);
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

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setPhotoUploading(true);
    try {
      const response = await uploadApi.uploadProfilePhoto(file);
      updateFormData({
        profilePhotoFile: file,
        profilePhotoUrl: response.url,
      });
    } catch (err) {
      setPhotoError('Failed to upload photo. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    updateFormData({ logoFile: null, logoUrl: '' });
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    updateFormData({ profilePhotoFile: null, profilePhotoUrl: '' });
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handleNext = () => {
    setCurrentStep(4); // Move to template selection
  };

  const handleBack = () => {
    setCurrentStep(2);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Your Branding</h2>
      <p className="text-gray-600 mb-8">
        Upload your business logo and professional photo to personalize your website (Both Optional)
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Business Logo Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Business Logo</h3>
          <p className="text-sm text-gray-600">
            Your company, firm, or practice logo
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            {!logoPreview ? (
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="mt-4">
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <span>Choose Logo</span>
                    <input
                      id="logo-upload"
                      name="logo-upload"
                      type="file"
                      className="sr-only"
                      ref={logoInputRef}
                      accept="image/*"
                      onChange={handleLogoSelect}
                    />
                  </label>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  PNG, JPG, GIF, WebP up to 5MB
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative w-40 h-40 mx-auto">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  {logoUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="text-white text-sm">Uploading...</div>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <button
                    onClick={handleRemoveLogo}
                    className="text-red-500 hover:text-red-700 font-medium text-sm"
                  >
                    Remove Logo
                  </button>
                </div>
              </div>
            )}

            {logoError && (
              <p className="text-red-500 text-sm mt-2 text-center">{logoError}</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
            <p className="font-semibold text-blue-900 mb-1">Best for logos:</p>
            <ul className="text-blue-800 space-y-0.5 list-disc list-inside">
              <li>Square aspect ratio (1:1)</li>
              <li>Transparent background (PNG)</li>
              <li>Min size: 500x500px</li>
            </ul>
          </div>
        </div>

        {/* Profile Photo Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Profile Photo</h3>
          <p className="text-sm text-gray-600">
            Your professional headshot or team photo
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            {!photoPreview ? (
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <div className="mt-4">
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <span>Choose Photo</span>
                    <input
                      id="photo-upload"
                      name="photo-upload"
                      type="file"
                      className="sr-only"
                      ref={photoInputRef}
                      accept="image/*"
                      onChange={handleProfilePhotoSelect}
                    />
                  </label>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  PNG, JPG, GIF, WebP up to 5MB
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative w-40 h-40 mx-auto">
                  <img
                    src={photoPreview}
                    alt="Profile photo preview"
                    className="w-full h-full object-cover rounded-full"
                  />
                  {photoUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                      <div className="text-white text-sm">Uploading...</div>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <button
                    onClick={handleRemovePhoto}
                    className="text-red-500 hover:text-red-700 font-medium text-sm"
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            )}

            {photoError && (
              <p className="text-red-500 text-sm mt-2 text-center">{photoError}</p>
            )}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs">
            <p className="font-semibold text-green-900 mb-1">Best for photos:</p>
            <ul className="text-green-800 space-y-0.5 list-disc list-inside">
              <li>Professional headshot</li>
              <li>Good lighting and contrast</li>
              <li>Neutral background</li>
              <li>Friendly, approachable expression</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Skip Option */}
      <div className="text-center mt-8">
        <button
          onClick={handleNext}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Skip this step - I'll add branding later
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={handleBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={logoUploading || photoUploading}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Choose Template →
        </button>
      </div>
    </div>
  );
};

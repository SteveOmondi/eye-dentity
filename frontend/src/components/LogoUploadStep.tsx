import { useState, useRef } from 'react';
import { useFormStore } from '../store/formStore';
import { uploadApi } from '../api/upload';

export const LogoUploadStep = () => {
  const { formData, updateFormData, setCurrentStep } = useFormStore();
  const [preview, setPreview] = useState<string>(formData.logoUrl || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const response = await uploadApi.uploadLogo(file);
      updateFormData({
        logoFile: file,
        logoUrl: response.url,
      });
    } catch (err) {
      setError('Failed to upload logo. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    updateFormData({ logoFile: null, logoUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNext = () => {
    setCurrentStep(4); // Move to template selection
  };

  const handleBack = () => {
    setCurrentStep(2);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Upload Your Logo</h2>
      <p className="text-gray-600 mb-8">
        Add your professional logo to personalize your website (Optional)
      </p>

      <div className="space-y-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          {!preview ? (
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
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <span>Choose file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                PNG, JPG, GIF, WebP up to 5MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative w-48 h-48 mx-auto">
                <img
                  src={preview}
                  alt="Logo preview"
                  className="w-full h-full object-contain rounded-lg"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="text-white">Uploading...</div>
                  </div>
                )}
              </div>
              <div className="text-center">
                <button
                  onClick={handleRemove}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Remove Logo
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Tips for best results:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Use a square logo (1:1 aspect ratio) for best results</li>
            <li>Transparent background works best (PNG format)</li>
            <li>Minimum recommended size: 500x500 pixels</li>
            <li>High contrast logos are more readable</li>
          </ul>
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <button
            onClick={handleNext}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Skip this step - I'll add a logo later
          </button>
        </div>
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
          disabled={uploading}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Choose Template →
        </button>
      </div>
    </div>
  );
};

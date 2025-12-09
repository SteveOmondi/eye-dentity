import { useState, useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { templateApi } from '../api/template';
import { TemplateCard } from './TemplateCard';
import { ColorSchemePicker } from './ColorSchemePicker';

interface Template {
  id: string;
  name: string;
  category: string;
  description?: string;
  previewUrl?: string;
  cssStyles: {
    colorPalettes: Array<{
      name: string;
      primary: string;
      secondary: string;
      accent: string;
    }>;
  };
}

export const TemplateSelectionStep = () => {
  const { formData, updateFormData, setCurrentStep } = useFormStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await templateApi.getAll();
      setTemplates(response.templates || []);
    } catch (err) {
      setError('Failed to load templates. Please try again.');
      console.error('Template fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === formData.selectedTemplate);
  const colorSchemes = selectedTemplate?.cssStyles?.colorPalettes || [];

  const filteredTemplates =
    selectedFilter === 'all'
      ? templates
      : templates.filter((t) => t.category === selectedFilter);

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'professional', label: 'Professional' },
    { value: 'creative', label: 'Creative' },
    { value: 'healthcare', label: 'Healthcare' },
  ];

  const handleTemplateSelect = (templateId: string) => {
    updateFormData({ selectedTemplate: templateId, selectedColorScheme: null });
  };

  const handleColorSchemeSelect = (scheme: any) => {
    updateFormData({ selectedColorScheme: scheme });
  };

  const handleNext = () => {
    if (!formData.selectedTemplate) {
      setError('Please select a template');
      return;
    }
    if (!formData.selectedColorScheme) {
      setError('Please select a color scheme');
      return;
    }
    setCurrentStep(5); // Move to domain/hosting selection
  };

  const handleBack = () => {
    setCurrentStep(3);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading templates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Choose Your Template</h2>
      <p className="text-gray-600 mb-8">
        Select a professional template and customize it with your preferred color scheme
      </p>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedFilter(cat.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${selectedFilter === cat.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template Gallery */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Templates</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={formData.selectedTemplate === template.id}
              onSelect={() => handleTemplateSelect(template.id)}
            />
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No templates found in this category
          </div>
        )}
      </div>

      {/* Color Scheme Picker - Only show if template is selected */}
      {selectedTemplate && colorSchemes.length > 0 && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <ColorSchemePicker
            colorSchemes={colorSchemes}
            selectedScheme={formData.selectedColorScheme}
            onSelect={handleColorSchemeSelect}
          />
        </div>
      )}

      {/* Selection Summary */}
      {formData.selectedTemplate && formData.selectedColorScheme && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">
              Great choice! {selectedTemplate!.name} with {formData.selectedColorScheme.name} color scheme
            </span>
          </div>
        </div>
      )}

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
          disabled={!formData.selectedTemplate || !formData.selectedColorScheme}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

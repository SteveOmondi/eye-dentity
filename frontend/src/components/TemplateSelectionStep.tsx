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
  const { formData, updateFormData } = useFormStore();
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
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === formData.selectedTemplate);
  const defaultAIPalettes = [
    { name: 'Cyber Neon', primary: '#c4f042', secondary: '#9d50bb', accent: '#6e48aa' },
    { name: 'Deep Space', primary: '#00d2ff', secondary: '#3a7bd5', accent: '#004e92' },
    { name: 'Solar Flare', primary: '#f8ff00', secondary: '#f8ff00', accent: '#f8ff00' },
    { name: 'Crimson Peak', primary: '#ff0000', secondary: '#000000', accent: '#ff0000' },
  ];
  const colorSchemes = formData.useAIDesign ? defaultAIPalettes : (selectedTemplate?.cssStyles?.colorPalettes || []);

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
    updateFormData({ selectedTemplate: templateId, selectedColorScheme: null, colorScheme: 'default' });
  };

  const handleColorSchemeSelect = (scheme: any) => {
    updateFormData({ selectedColorScheme: scheme, colorScheme: scheme.name });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <div className="w-12 h-12 border-2 border-wizard-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-wizard-accent animate-pulse">Loading Templates</p>
      </div>
    );
  }

  return (
    <div className="p-0 animate-fade-up">
      <div className="mb-12">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Structural <span className="text-wizard-accent">Matrix</span></h2>
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
          Select a structural archetype and color calibration to define your digital interface.
        </p>
      </div>

      {error && (
        <div className="mb-10 bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest animate-pulse">
          Critical Error: {error}
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-12">
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedFilter(cat.value)}
              className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all whitespace-nowrap border ${selectedFilter === cat.value
                ? 'bg-wizard-accent text-black border-wizard-accent shadow-[0_0_30px_rgba(196,240,66,0.3)] scale-105'
                : 'bg-white/[0.03] text-gray-500 border-white/5 hover:bg-white/10 hover:text-white'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-20">
        {/* Template Gallery */}
        <div>
          <div className="flex items-center gap-6 mb-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent/80 whitespace-nowrap">Archetype Selection</h3>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* AI Dynamic Design Option */}
            <div
              onClick={() => updateFormData({ useAIDesign: true, selectedTemplate: null })}
              className={`group relative rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-700 backdrop-blur-3xl border-2 ${formData.useAIDesign
                ? 'border-wizard-accent bg-wizard-accent/5 scale-105 shadow-[0_0_100px_rgba(196,240,66,0.1)]'
                : 'border-white/10 bg-white/[0.02] hover:border-wizard-accent/30 hover:bg-white/[0.04]'
                }`}
            >
              <div className="aspect-[16/10] relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-mesh-gradient opacity-20 group-hover:opacity-40 transition-opacity animate-pulse-slow" />
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="w-24 h-24 rounded-[2rem] bg-wizard-accent/10 border border-wizard-accent/20 flex items-center justify-center shadow-[0_0_50px_rgba(196,240,66,0.1)] group-hover:scale-110 transition-transform duration-700">
                    <svg className="w-12 h-12 text-wizard-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-wizard-accent text-[10px] font-black uppercase tracking-[0.4em] mb-1">PROMPT-TO-DESIGN</p>
                    <h3 className="text-white text-2xl font-black tracking-tighter uppercase">Forge AI Design</h3>
                  </div>
                </div>
              </div>
              <div className="p-8 border-t border-white/5">
                <p className="text-gray-400 text-sm font-medium leading-relaxed">
                  Bypass templates. Our AI engine will craft a unique, path-dependent design genome based on your identity profile.
                </p>
              </div>
              {formData.useAIDesign && (
                <div className="absolute top-6 left-6">
                  <span className="bg-wizard-accent text-black text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl shadow-2xl">
                    ACTIVE FORGE
                  </span>
                </div>
              )}
            </div>

            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={formData.selectedTemplate === template.id}
                onSelect={() => {
                  handleTemplateSelect(template.id);
                  updateFormData({ useAIDesign: false });
                }}
              />
            ))}
          </div>

          {filteredTemplates.length === 0 && !formData.useAIDesign && (
            <div className="text-center py-24 glass-card border border-dashed border-white/10 rounded-[2rem]">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700">No archetypes detected in this sector</p>
            </div>
          )}
        </div>

        {/* Color Scheme Picker */}
        {(selectedTemplate || formData.useAIDesign) && colorSchemes.length > 0 && (
          <div className="animate-fade-up">
            <div className="flex items-center gap-6 mb-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent/80 whitespace-nowrap">Chromatic Calibration</h3>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-wizard-accent/5 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative glass-card border border-white/5 rounded-[2.5rem] p-10 overflow-hidden transform group-hover:scale-[1.01] transition-transform duration-500">
                <ColorSchemePicker
                  colorSchemes={colorSchemes}
                  selectedScheme={formData.selectedColorScheme}
                  onSelect={handleColorSchemeSelect}
                />
              </div>
            </div>
          </div>
        )}

        {/* Selection Success Feedback */}
        {(formData.selectedTemplate || formData.useAIDesign) && formData.selectedColorScheme && (
          <div className="glass-card border border-wizard-accent/20 rounded-[2rem] p-10 flex flex-col md:flex-row items-center gap-8 animate-fade-in relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-wizard-accent/5 blur-[100px] pointer-events-none group-hover:bg-wizard-accent/10 transition-colors" />

            <div className="w-20 h-20 rounded-3xl bg-wizard-accent/10 border border-wizard-accent/20 flex items-center justify-center shadow-[0_0_30px_rgba(196,240,66,0.1)]">
              <svg className="w-10 h-10 text-wizard-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-wizard-accent mb-2">Configuration Locked</p>
              <p className="text-xl text-white font-black tracking-tight uppercase">
                Archetype: <span className="text-wizard-accent">{formData.useAIDesign ? 'AI FORGE' : selectedTemplate?.name}</span><br />
                Palette: <span className="text-wizard-accent">{formData.selectedColorScheme.name}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


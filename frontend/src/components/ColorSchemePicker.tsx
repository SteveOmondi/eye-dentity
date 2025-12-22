interface ColorScheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
}

interface ColorSchemePickerProps {
  colorSchemes: ColorScheme[];
  selectedScheme: ColorScheme | null;
  onSelect: (scheme: ColorScheme) => void;
}

export const ColorSchemePicker = ({
  colorSchemes,
  selectedScheme,
  onSelect,
}: ColorSchemePickerProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-widest text-wizard-accent mb-2">Color Palette</h4>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Select a scheme that reflects your brand identity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {colorSchemes.map((scheme) => {
          const isSelected =
            selectedScheme?.name === scheme.name &&
            selectedScheme?.primary === scheme.primary;

          return (
            <button
              key={scheme.name}
              onClick={() => onSelect(scheme)}
              className={`group relative p-4 rounded-xl border transition-all duration-300 text-left backdrop-blur-md ${isSelected
                  ? 'bg-white/10 border-wizard-accent shadow-[0_0_20px_rgba(196,240,66,0.1)]'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
            >
              {/* Color Swatches */}
              <div className="flex gap-1.5 mb-4">
                <div
                  className="w-10 h-10 rounded-lg shadow-inner border border-white/10"
                  style={{ backgroundColor: scheme.primary }}
                  title="Primary"
                />
                <div
                  className="w-10 h-10 rounded-lg shadow-inner border border-white/10"
                  style={{ backgroundColor: scheme.secondary }}
                  title="Secondary"
                />
                <div
                  className="w-10 h-10 rounded-lg shadow-inner border border-white/10"
                  style={{ backgroundColor: scheme.accent }}
                  title="Accent"
                />
              </div>

              {/* Scheme Name */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isSelected ? 'text-wizard-accent' : 'text-gray-400 group-hover:text-white'}`}>
                  {scheme.name}
                </span>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-wizard-accent flex items-center justify-center shadow-[0_0_10px_var(--wizard-accent-muted)]">
                    <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};


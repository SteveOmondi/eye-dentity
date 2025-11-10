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
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-900">Choose Color Scheme</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {colorSchemes.map((scheme) => {
          const isSelected =
            selectedScheme?.name === scheme.name &&
            selectedScheme?.primary === scheme.primary;

          return (
            <button
              key={scheme.name}
              onClick={() => onSelect(scheme)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {/* Color Swatches */}
              <div className="flex gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: scheme.primary }}
                  title="Primary"
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: scheme.secondary }}
                  title="Secondary"
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: scheme.accent }}
                  title="Accent"
                />
              </div>

              {/* Scheme Name */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {scheme.name}
                </span>
                {isSelected && (
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              {/* Color Hex Codes */}
              <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                <div className="flex justify-between">
                  <span>Primary:</span>
                  <span className="font-mono">{scheme.primary}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

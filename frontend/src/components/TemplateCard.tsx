interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    category: string;
    description?: string;
    previewUrl?: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

export const TemplateCard = ({ template, isSelected, onSelect }: TemplateCardProps) => {
  return (
    <div
      onClick={onSelect}
      className={`relative rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      {/* Preview Image */}
      <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
        {template.previewUrl ? (
          <img
            src={template.previewUrl}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Template Info */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            <p className="text-xs text-gray-500 uppercase mt-1">
              {template.category}
            </p>
          </div>
          {isSelected && (
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
        {template.description && (
          <p className="text-sm text-gray-600 mt-2">{template.description}</p>
        )}
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded">
          Selected
        </div>
      )}
    </div>
  );
};

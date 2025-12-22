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
      className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 bg-white/5 border backdrop-blur-xl ${isSelected
          ? 'border-wizard-accent shadow-[0_0_30px_rgba(196,240,66,0.15)] scale-[1.02]'
          : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
        }`}
    >
      {/* Preview Image Container */}
      <div className="aspect-[16/10] bg-white/5 relative overflow-hidden">
        {template.previewUrl ? (
          <img
            src={template.previewUrl}
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className={`absolute inset-0 transition-opacity duration-300 ${isSelected ? 'bg-wizard-accent/5' : 'bg-transparent group-hover:bg-black/20'}`} />
      </div>

      {/* Template Info */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className={`font-black text-lg transition-colors ${isSelected ? 'text-wizard-accent' : 'text-white'}`}>
              {template.name}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {template.category}
            </p>
          </div>
          {isSelected && (
            <div className="flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-wizard-accent flex items-center justify-center shadow-[0_0_15px_var(--wizard-accent-muted)]">
                <svg className="w-3.5 h-3.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </div>
        {template.description && (
          <p className="text-sm text-gray-400 mt-3 line-clamp-2 leading-relaxed">
            {template.description}
          </p>
        )}
      </div>

      {/* Selected Ribbon Tag */}
      {isSelected && (
        <div className="absolute top-4 left-4">
          <span className="bg-wizard-accent text-black text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg">
            Selected
          </span>
        </div>
      )}
    </div>
  );
};


import { useState } from 'react';
import { useFormStore } from '../store/formStore';

export const BioServicesStep = () => {
  const { formData, updateFormData } = useFormStore();
  const [newService, setNewService] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newServiceArea, setNewServiceArea] = useState('');

  const addService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      updateFormData({
        services: [...formData.services, newService.trim()],
      });
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    updateFormData({
      services: formData.services.filter((_, i) => i !== index),
    });
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !formData.specializations.includes(newSpecialization.trim())) {
      updateFormData({
        specializations: [...formData.specializations, newSpecialization.trim()],
      });
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (index: number) => {
    updateFormData({
      specializations: formData.specializations.filter((_, i) => i !== index),
    });
  };

  const addServiceArea = () => {
    if (newServiceArea.trim() && !formData.serviceAreas.includes(newServiceArea.trim())) {
      updateFormData({
        serviceAreas: [...formData.serviceAreas, newServiceArea.trim()],
      });
      setNewServiceArea('');
    }
  };

  const removeServiceArea = (index: number) => {
    updateFormData({
      serviceAreas: formData.serviceAreas.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="p-0 animate-fade-up">
      <div className="mb-12">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Narrative <span className="text-wizard-accent">& Assets</span></h2>
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-relaxed">
          Construct your professional narrative and define the core services of your digital entity.
        </p>
      </div>

      <div className="space-y-12">
        {/* Bio Textarea */}
        <div className="space-y-4">
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent/80 ml-1">
            Professional Chronicle
          </label>
          <div className="relative group">
            <textarea
              value={formData.bio}
              onChange={(e) => updateFormData({ bio: e.target.value })}
              rows={6}
              className="w-full bg-white/[0.02] border border-white/5 px-6 py-5 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-wizard-accent/30 transition-all resize-none font-medium leading-relaxed shadow-[0_0_30px_rgba(0,0,0,0.2)] hover:border-white/10"
              placeholder="Initialize biography stream..."
            />
            <div className="absolute top-4 right-6 pointer-events-none opacity-20">
              <svg className="w-5 h-5 text-wizard-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
          <div className="flex justify-between px-1">
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
              Standard: 150-300 characters
            </p>
            <p className={`text-[9px] uppercase tracking-widest font-black ${formData.bio.length > 300 ? 'text-red-500' : 'text-wizard-accent opacity-60'}`}>
              {formData.bio.length} characters
            </p>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="space-y-4">
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent/80 ml-1">
            Prime Directive
          </label>
          <div className="relative">
            <textarea
              value={formData.missionStatement}
              onChange={(e) => updateFormData({ missionStatement: e.target.value })}
              rows={3}
              className="w-full bg-white/[0.02] border border-white/5 px-6 py-5 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-wizard-accent/30 transition-all resize-none font-medium shadow-[0_0_30px_rgba(0,0,0,0.2)] hover:border-white/10"
              placeholder="Declare your core mission..."
            />
          </div>
          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest ml-1">
            Structural philosophy of your enterprise
          </p>
        </div>

        {/* Services Section */}
        <div className="space-y-6">
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent/80 ml-1">
            Service Protocols
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
              className="flex-1 bg-white/[0.02] border border-white/5 px-6 py-5 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-wizard-accent/30 transition-all shadow-[0_0_30px_rgba(0,0,0,0.2)] hover:border-white/10"
              placeholder="e.g. STRATEGIC CONSULTATION"
            />
            <button
              onClick={addService}
              type="button"
              className="px-10 py-5 bg-wizard-accent text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(196,240,66,0.2)]"
            >
              Link
            </button>
          </div>

          {formData.services.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.services.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white/[0.03] border border-white/5 px-6 py-4 rounded-2xl group hover:border-wizard-accent/30 transition-all"
                >
                  <span className="text-white text-xs font-black uppercase tracking-tight">{service}</span>
                  <button
                    onClick={() => removeService(index)}
                    className="text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Specializations */}
        <div className="space-y-6">
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent/80 ml-1">
            Neural Specializations
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              value={newSpecialization}
              onChange={(e) => setNewSpecialization(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
              className="flex-1 bg-white/[0.02] border border-white/5 px-6 py-5 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-wizard-accent/30 transition-all shadow-[0_0_30px_rgba(0,0,0,0.2)] hover:border-white/10"
              placeholder="e.g. CORPORATE STRATEGY"
            />
            <button
              onClick={addSpecialization}
              type="button"
              className="px-10 py-5 bg-wizard-accent/10 border border-wizard-accent/30 text-wizard-accent font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-wizard-accent hover:text-black transition-all"
            >
              Inject
            </button>
          </div>

          {formData.specializations.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {formData.specializations.map((spec, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-3 bg-wizard-accent/5 border border-wizard-accent/20 text-wizard-accent px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest group/item"
                >
                  {spec}
                  <button
                    onClick={() => removeSpecialization(index)}
                    className="text-wizard-accent/40 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Service Areas */}
        <div className="space-y-6">
          <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-wizard-accent/80 ml-1">
            Deployment Nodes (Location)
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              value={newServiceArea}
              onChange={(e) => setNewServiceArea(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addServiceArea())}
              className="flex-1 bg-white/[0.02] border border-white/5 px-6 py-5 rounded-2xl text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-wizard-accent/30 transition-all shadow-[0_0_30px_rgba(0,0,0,0.2)] hover:border-white/10"
              placeholder="e.g. GLOBAL, NEW YORK"
            />
            <button
              onClick={addServiceArea}
              type="button"
              className="px-10 py-5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white hover:text-black transition-all"
            >
              Deploy
            </button>
          </div>

          {formData.serviceAreas.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {formData.serviceAreas.map((area, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-3 bg-white/5 border border-white/10 text-gray-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest group/item"
                >
                  {area}
                  <button
                    onClick={() => removeServiceArea(index)}
                    className="text-gray-600 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


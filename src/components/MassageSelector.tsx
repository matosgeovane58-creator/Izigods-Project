import React, { useState } from 'react';
import { Check, Clock, Sparkles, Flame, Activity, Droplets, Compass, Zap, HeartHandshake, Feather } from 'lucide-react';
import { MassageType } from '../types.ts';
import { MASSAGE_TYPES } from '../data/massageData.ts';

interface MassageSelectorProps {
  selectedMassage: MassageType;
  onSelectMassage: (massage: MassageType) => void;
  selectedDuration: number;
  onSelectDuration: (durationMinutes: number) => void;
}

const CATEGORIES = ['Todas', 'Relaxamento', 'Terapêutica', 'Oriental', 'Estética'] as const;

export const MassageSelector: React.FC<MassageSelectorProps> = ({
  selectedMassage,
  onSelectMassage,
  selectedDuration,
  onSelectDuration,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Todas');

  const filteredMassages = activeCategory === 'Todas'
    ? MASSAGE_TYPES
    : MASSAGE_TYPES.filter(m => m.category === activeCategory);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-5 h-5 text-amber-600" />;
      case 'Activity': return <Activity className="w-5 h-5 text-emerald-600" />;
      case 'Droplets': return <Droplets className="w-5 h-5 text-cyan-600" />;
      case 'Compass': return <Compass className="w-5 h-5 text-purple-600" />;
      case 'Zap': return <Zap className="w-5 h-5 text-orange-600" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5 text-rose-600" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-500" />;
      default: return <Feather className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-sans">
            Passo 1 de 4
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">
            Escolha sua Terapia de Massagem
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Selecione a modalidade ideal para o seu momento de cura, relaxamento ou recuperação.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-stone-100/90 rounded-2xl border border-stone-200">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-emerald-800 text-amber-50 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Massage Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredMassages.map(massage => {
          const isSelected = selectedMassage.id === massage.id;
          const currentPrice = massage.durations.find(d => d.minutes === selectedDuration)?.price 
            || massage.durations[0].price;

          return (
            <div
              key={massage.id}
              onClick={() => {
                onSelectMassage(massage);
                // If the selected duration isn't available in this massage, default to first
                if (!massage.durations.some(d => d.minutes === selectedDuration)) {
                  onSelectDuration(massage.durations[0].minutes);
                }
              }}
              className={`group cursor-pointer rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between relative bg-white ${
                isSelected
                  ? 'border-emerald-700 ring-2 ring-emerald-700/20 shadow-md'
                  : 'border-stone-200/80 hover:border-emerald-600/50 hover:shadow-xs'
              }`}
            >
              {/* Top Row: Category & Selection check */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-100 group-hover:scale-105 transition-transform">
                      {getIcon(massage.icon)}
                    </div>
                    <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                      {massage.category}
                    </span>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-emerald-700 text-white scale-105'
                        : 'border border-stone-300 text-transparent group-hover:border-stone-400'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                {/* Title & Tagline */}
                <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug group-hover:text-emerald-900 transition-colors">
                  {massage.name}
                </h3>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                  {massage.tagline}
                </p>

                {/* Benefits Badges */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {massage.benefits.slice(0, 2).map((benefit, i) => (
                    <span
                      key={i}
                      className="text-[10px] text-stone-600 bg-stone-100/90 px-2 py-0.5 rounded-md"
                    >
                      ✓ {benefit}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Row: Duration & Pricing */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
                    A partir de
                  </span>
                  <span className="text-lg font-bold text-stone-900">
                    R$ {currentPrice}
                  </span>
                </div>

                {/* Duration options pill switcher if selected */}
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                  {massage.durations.map(dur => (
                    <button
                      key={dur.minutes}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMassage(massage);
                        onSelectDuration(dur.minutes);
                      }}
                      className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all flex items-center gap-1 ${
                        isSelected && selectedDuration === dur.minutes
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                      }`}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      {dur.minutes}min
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

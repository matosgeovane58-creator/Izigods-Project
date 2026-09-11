import React from 'react';
import { Star, Check, Sparkles, UserCheck } from 'lucide-react';
import { Therapist } from '../types.ts';
import { THERAPISTS } from '../data/massageData.ts';

interface TherapistSelectorProps {
  selectedTherapistId: string; // 'any' or therapist.id
  onSelectTherapist: (therapist: Therapist | null) => void;
}

export const TherapistSelector: React.FC<TherapistSelectorProps> = ({
  selectedTherapistId,
  onSelectTherapist,
}) => {
  return (
    <section className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-sans">
          Passo 2 de 4
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">
          Escolha o Profissional
        </h2>
        <p className="text-sm text-stone-600 mt-1">
          Nossa equipe é formada por fisioterapeutas e massoterapeutas certificados com especializações internacionais.
        </p>
      </div>

      {/* Grid: Any Professional option + Specific Therapists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Option: Any Professional */}
        <div
          onClick={() => onSelectTherapist(null)}
          className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between relative bg-white ${
            selectedTherapistId === 'any'
              ? 'border-emerald-700 ring-2 ring-emerald-700/20 shadow-md bg-emerald-50/20'
              : 'border-stone-200/80 hover:border-emerald-600/50 hover:shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  selectedTherapistId === 'any'
                    ? 'bg-emerald-700 text-white'
                    : 'border border-stone-300 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            <h3 className="font-serif font-bold text-base text-stone-900 leading-snug">
              Qualquer Profissional
            </h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Maior disponibilidade de dias e horários para o seu atendimento.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
            <UserCheck className="w-4 h-4" />
            <span>Alocação automática</span>
          </div>
        </div>

        {/* Specific Therapists */}
        {THERAPISTS.map(therapist => {
          const isSelected = selectedTherapistId === therapist.id;

          return (
            <div
              key={therapist.id}
              onClick={() => onSelectTherapist(therapist)}
              className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between relative bg-white ${
                isSelected
                  ? 'border-emerald-700 ring-2 ring-emerald-700/20 shadow-md'
                  : 'border-stone-200/80 hover:border-emerald-600/50 hover:shadow-xs'
              }`}
            >
              <div>
                {/* Avatar and Check */}
                <div className="flex items-center justify-between mb-3">
                  <div className="relative">
                    <img
                      src={therapist.avatar}
                      alt={therapist.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-stone-100 shadow-xs"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></span>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-emerald-700 text-white'
                        : 'border border-stone-300 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                {/* Name & Role */}
                <h3 className="font-serif font-bold text-base text-stone-900 leading-snug">
                  {therapist.name}
                </h3>
                <p className="text-[11px] text-emerald-800 font-medium mt-0.5 line-clamp-1">
                  {therapist.role}
                </p>

                {/* Rating & Exp */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{therapist.rating}</span>
                  </div>
                  <span className="text-[11px] text-stone-400">
                    ({therapist.reviewsCount} avaliações)
                  </span>
                </div>

                {/* Specialties chips */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {therapist.specialties.slice(0, 2).map((spec, i) => (
                    <span
                      key={i}
                      className="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-500 font-medium">
                {therapist.experienceYears} anos de prática clínica
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

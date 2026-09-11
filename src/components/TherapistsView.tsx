import React from 'react';
import { Star, Calendar, Award, CheckCircle2, HeartHandshake, ArrowRight } from 'lucide-react';
import { Therapist } from '../types.ts';
import { THERAPISTS } from '../data/massageData.ts';

interface TherapistsViewProps {
  onSelectTherapistForBooking: (therapist: Therapist) => void;
}

export const TherapistsView: React.FC<TherapistsViewProps> = ({
  onSelectTherapistForBooking,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-sans">
          Corpo Clínico
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">
          Nossos Terapeutas e Especialistas
        </h2>
        <p className="text-sm text-stone-600 mt-1 max-w-2xl">
          Conheça os profissionais que cuidam do seu corpo e mente com excelência técnica, ética e toque terapêutico acolhedor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {THERAPISTS.map(therapist => (
          <div
            key={therapist.id}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              {/* Top: Photo, Name, Rating */}
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={therapist.avatar}
                  alt={therapist.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-stone-100 shadow-xs shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-xl text-stone-900">
                      {therapist.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{therapist.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                    {therapist.role}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    {therapist.reviewsCount} avaliações de pacientes verificados
                  </p>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                {therapist.bio}
              </p>

              {/* Specialties & Exp */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span><strong>{therapist.experienceYears} anos</strong> de atuação em clínicas e spas de luxo</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {therapist.specialties.map((spec, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-4 border-t border-stone-100">
              <button
                onClick={() => onSelectTherapistForBooking(therapist)}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Calendar className="w-4 h-4 text-amber-300" />
                <span>Agendar com {therapist.name.split(' ')[0]}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

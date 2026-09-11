import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Sun, Sunset, Moon, CheckCircle2 } from 'lucide-react';
import { TIME_SLOTS } from '../data/massageData.ts';
import { Booking } from '../types.ts';

interface CalendarPickerProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  selectedTime: string; // HH:MM
  onSelectTime: (time: string) => void;
  existingBookings: Booking[];
  therapistId: string;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  existingBookings,
  therapistId,
}) => {
  // Parse currently selected date or initialize to today
  const initialDate = selectedDate ? new Date(selectedDate + 'T12:00:00') : new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Generate calendar days for current month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const formatDateString = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Quick shortcuts
  const selectToday = () => {
    const d = new Date();
    const str = formatDateString(d.getFullYear(), d.getMonth(), d.getDate());
    setCurrentMonth(d.getMonth());
    setCurrentYear(d.getFullYear());
    onSelectDate(str);
  };

  const selectTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const str = formatDateString(d.getFullYear(), d.getMonth(), d.getDate());
    setCurrentMonth(d.getMonth());
    setCurrentYear(d.getFullYear());
    onSelectDate(str);
  };

  // Check if a time slot is booked for selected date and therapist
  const isSlotBooked = (time: string) => {
    return existingBookings.some(b => {
      if (b.status === 'cancelado') return false;
      if (b.date !== selectedDate) return false;
      if (b.time !== time) return false;
      if (therapistId === 'any') return false; // Any therapist could find a non-booked professional
      return b.therapistId === therapistId;
    });
  };

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case 'Manhã': return <Sun className="w-3.5 h-3.5 text-amber-600" />;
      case 'Tarde': return <Sunset className="w-3.5 h-3.5 text-orange-600" />;
      case 'Noite': return <Moon className="w-3.5 h-3.5 text-indigo-600" />;
      default: return <Clock className="w-3.5 h-3.5 text-stone-500" />;
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-sans">
          Passo 3 de 4
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">
          Data e Horário da Sessão
        </h2>
        <p className="text-sm text-stone-600 mt-1">
          Selecione o dia no calendário interativo e escolha um dos horários disponíveis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-xs">
        {/* Left Column: Interactive Calendar (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            {/* Month & Navigation Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-700" />
                <h3 className="font-serif font-bold text-lg text-stone-900 capitalize">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition-colors border border-stone-200"
                  aria-label="Mês anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition-colors border border-stone-200"
                  aria-label="Próximo mês"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick date shortcuts */}
            <div className="flex items-center gap-2 mb-4 text-xs">
              <span className="text-stone-400 font-medium">Atalhos:</span>
              <button
                type="button"
                onClick={selectToday}
                className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium transition-colors"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={selectTomorrow}
                className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium transition-colors"
              >
                Amanhã
              </button>
            </div>

            {/* Day of Week Labels */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-stone-400 mb-2">
              {WEEK_DAYS.map((wd, i) => (
                <div key={i} className="py-1">
                  {wd}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="h-10 sm:h-12" />;
                }

                const dateStr = formatDateString(currentYear, currentMonth, day);
                const dayDate = new Date(currentYear, currentMonth, day);
                dayDate.setHours(0, 0, 0, 0);

                const isPast = dayDate < today;
                const isSelected = selectedDate === dateStr;
                const isToday = dayDate.getTime() === today.getTime();

                return (
                  <button
                    key={dateStr}
                    type="button"
                    disabled={isPast}
                    onClick={() => onSelectDate(dateStr)}
                    className={`h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center relative transition-all text-sm font-medium ${
                      isPast
                        ? 'opacity-30 cursor-not-allowed text-stone-400 bg-stone-50/50'
                        : isSelected
                        ? 'bg-emerald-800 text-white font-bold shadow-sm scale-105 z-10'
                        : isToday
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold hover:bg-emerald-100'
                        : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    <span>{day}</span>
                    {isSelected && (
                      <span className="w-1 h-1 rounded-full bg-amber-300 mt-0.5" />
                    )}
                    {isToday && !isSelected && (
                      <span className="text-[9px] uppercase tracking-tighter text-emerald-700 font-bold">
                        Hoje
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-700" /> Selecionado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-200 border border-emerald-400" /> Hoje
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-stone-300" /> Indisponível
            </span>
          </div>
        </div>

        {/* Right Column: Time Slots (5 cols) */}
        <div className="lg:col-span-5 lg:border-l lg:border-stone-100 lg:pl-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-700" />
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  Horários Disponíveis
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                {selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Escolha a data'}
              </span>
            </div>

            {!selectedDate ? (
              <div className="py-12 text-center text-stone-400 text-xs">
                Selecione um dia no calendário ao lado para visualizar os horários disponíveis.
              </div>
            ) : (
              <div className="space-y-4">
                {TIME_SLOTS.map(group => (
                  <div key={group.period} className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
                      {getPeriodIcon(group.period)}
                      <span>{group.period}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {group.times.map(time => {
                        const booked = isSlotBooked(time);
                        const isSelected = selectedTime === time;

                        return (
                          <button
                            key={time}
                            type="button"
                            disabled={booked}
                            onClick={() => onSelectTime(time)}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all border ${
                              booked
                                ? 'bg-stone-50 border-stone-200/60 text-stone-400 line-through cursor-not-allowed'
                                : isSelected
                                ? 'bg-emerald-800 border-emerald-800 text-white shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:border-emerald-600 hover:bg-stone-50'
                            }`}
                          >
                            <span>{time}</span>
                            {isSelected ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                            ) : booked ? (
                              <span className="text-[10px] text-stone-400 no-underline">Ocupado</span>
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Summary reminder */}
          {selectedDate && selectedTime && (
            <div className="mt-6 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 flex items-center justify-between">
              <div>
                <span className="font-semibold block">Horário Reservado:</span>
                <span>
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} às {selectedTime}
                </span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

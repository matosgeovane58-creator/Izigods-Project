import React, { useState } from 'react';
import { User, Mail, Phone, FileText, CheckCircle2, ShieldCheck, Clock, Calendar, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { MassageType, Therapist } from '../types.ts';

interface BookingFormProps {
  selectedMassage: MassageType;
  selectedTherapist: Therapist | null;
  selectedDate: string;
  selectedTime: string;
  selectedDuration: number;
  onSubmitBooking: (formData: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    notes: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  selectedMassage,
  selectedTherapist,
  selectedDate,
  selectedTime,
  selectedDuration,
  onSubmitBooking,
  isLoading,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const price = selectedMassage.durations.find(d => d.minutes === selectedDuration)?.price 
    || selectedMassage.durations[0].price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Por favor, informe seu nome completo.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Por favor, informe um endereço de e-mail válido para receber a confirmação.');
      return;
    }

    if (!selectedDate || !selectedTime) {
      setErrorMsg('Por favor, selecione um dia e um horário no calendário acima.');
      return;
    }

    await onSubmitBooking({
      clientName: name.trim(),
      clientEmail: email.trim(),
      clientPhone: phone.trim(),
      notes: notes.trim(),
    });
  };

  const formattedDate = selectedDate
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Nenhuma data selecionada';

  return (
    <section className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-sans">
          Passo 4 de 4
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">
          Identificação do Cliente e Confirmação
        </h2>
        <p className="text-sm text-stone-600 mt-1">
          Preencha seus dados para finalizarmos o agendamento. Os dados serão salvos no Supabase para controle e disparo da automação de confirmação.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Fields (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-5">
          <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-700" />
            Dados do Cliente
          </h3>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Nome do Cliente */}
          <div>
            <label htmlFor="client-name" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Nome Completo <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="client-name"
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Dra. Juliana Silveira"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all placeholder:text-stone-400 bg-stone-50/50 focus:bg-white"
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* E-mail do Cliente */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="client-email" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                E-mail para Confirmação <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-emerald-700 font-medium">
                Confirmação por E-mail
              </span>
            </div>
            <div className="relative">
              <input
                id="client-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="exemplo@gmail.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all placeholder:text-stone-400 bg-stone-50/50 focus:bg-white"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              O Supabase registrará este e-mail para o disparo automático do comprovante e orientações pré-sessão.
            </p>
          </div>

          {/* Telefone / WhatsApp */}
          <div>
            <label htmlFor="client-phone" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Telefone / WhatsApp (Opcional)
            </label>
            <div className="relative">
              <input
                id="client-phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(11) 99999-8888"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all placeholder:text-stone-400 bg-stone-50/50 focus:bg-white"
              />
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Observações / Foco */}
          <div>
            <label htmlFor="client-notes" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Observações, Foco de Dor ou Preferências
            </label>
            <div className="relative">
              <textarea
                id="client-notes"
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ex: Tensão lombar intensa, prefiro pressão moderada, alergia a óleo mineral..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all placeholder:text-stone-400 bg-stone-50/50 focus:bg-white resize-none"
              />
              <FileText className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>
        </div>

        {/* Right: Booking Summary & Final Button (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
                  Resumo da Reserva
                </span>
                <h4 className="font-serif font-bold text-xl text-white mt-0.5">
                  {selectedMassage.name}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-400 block">Total</span>
                <span className="text-2xl font-bold text-amber-200">
                  R$ {price}
                </span>
              </div>
            </div>

            {/* Chosen details list */}
            <div className="space-y-3 text-xs text-stone-300">
              <div className="flex items-center justify-between py-1 border-b border-stone-800/80">
                <span className="flex items-center gap-2 text-stone-400">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Dia:
                </span>
                <span className="font-semibold text-white capitalize">
                  {formattedDate}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-stone-800/80">
                <span className="flex items-center gap-2 text-stone-400">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Horário e Duração:
                </span>
                <span className="font-semibold text-white">
                  {selectedTime || 'A definir'} ({selectedDuration} minutos)
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-stone-800/80">
                <span className="flex items-center gap-2 text-stone-400">
                  <User className="w-4 h-4 text-emerald-400" />
                  Profissional:
                </span>
                <span className="font-semibold text-white">
                  {selectedTherapist ? selectedTherapist.name : 'Qualquer Profissional Disponível'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 text-stone-400">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Intensidade:
                </span>
                <span className="font-semibold text-amber-200">
                  {selectedMassage.intensity}
                </span>
              </div>
            </div>

            {/* Supabase automation assurance badge */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-[11px] text-emerald-200 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Controle via Supabase:</strong> Registro seguro na tabela <code>agendamentos</code> com automação de envio de e-mail ativada.
              </span>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading || !selectedDate || !selectedTime}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 shadow-md transition-all ${
              isLoading || !selectedDate || !selectedTime
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-emerald-800 hover:bg-emerald-900 text-white hover:shadow-lg active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Gravando e Disparando Automação...</span>
              </>
            ) : (
              <>
                <span>Confirmar Agendamento</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

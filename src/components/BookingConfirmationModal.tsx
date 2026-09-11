import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Calendar, Clock, User, Mail, Database, Send, ExternalLink, X, Share2, Sparkles } from 'lucide-react';
import { Booking } from '../types.ts';

interface BookingConfirmationModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onGoToAdmin: () => void;
  syncedToSupabase: boolean;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  booking,
  isOpen,
  onClose,
  onGoToAdmin,
  syncedToSupabase,
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#047857', '#d97706', '#10b981', '#f59e0b'],
        });
      } catch (e) {
        console.error('Erro no confetti:', e);
      }
    }
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  // Generate Google Calendar Link
  const makeGoogleCalendarLink = () => {
    const startTime = booking.time.replace(':', '');
    // compute end time roughly based on duration
    const [h, m] = booking.time.split(':').map(Number);
    const endMinutes = h * 60 + m + (booking.durationMinutes || 60);
    const endH = String(Math.floor(endMinutes / 60)).padStart(2, '0');
    const endM = String(endMinutes % 60).padStart(2, '0');
    const endTime = `${endH}${endM}`;

    const dateFormatted = booking.date.replace(/-/g, '');
    const dates = `${dateFormatted}T${startTime}00/${dateFormatted}T${endTime}00`;
    const title = encodeURIComponent(`Sessão de ${booking.massageName} - Zenith Massoterapia`);
    const details = encodeURIComponent(
      `Agendamento confirmado para ${booking.clientName}.\nProfissional: ${booking.therapistName}\nDuração: ${booking.durationMinutes} minutos.\nValor: R$ ${booking.price}\nCódigo: ${booking.id}`
    );
    const location = encodeURIComponent('Zenith Massoterapia & Bem-Estar');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  // WhatsApp share link
  const makeWhatsAppLink = () => {
    const text = encodeURIComponent(
      `Olá! Meu agendamento na Zenith Massoterapia foi confirmado:\n` +
      `✨ *${booking.massageName}*\n` +
      `🗓 Data: ${booking.date} às ${booking.time}\n` +
      `👤 Terapeuta: ${booking.therapistName}\n` +
      `📋 Código: ${booking.id}\n` +
      `Obrigado!`
    );
    return `https://wa.me/?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with success icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-1">
            Agendamento Confirmado!
          </span>
          <h3 className="font-serif font-bold text-2xl text-stone-900">
            Sua Sessão Está Marcada
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Código do comprovante: <strong className="font-mono text-stone-700">{booking.id}</strong>
          </p>
        </div>

        {/* Voucher / Receipt Card */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-3 text-xs text-stone-700 mb-5">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <span className="font-bold text-stone-900 text-sm">{booking.massageName}</span>
            <span className="font-bold text-emerald-800 text-sm">R$ {booking.price}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="text-stone-400 block text-[10px]">Data</span>
                <span className="font-semibold text-stone-900">
                  {new Date(booking.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="text-stone-400 block text-[10px]">Horário</span>
                <span className="font-semibold text-stone-900">{booking.time} ({booking.durationMinutes} min)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="text-stone-400 block text-[10px]">Cliente</span>
                <span className="font-semibold text-stone-900 truncate">{booking.clientName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="text-stone-400 block text-[10px]">Profissional</span>
                <span className="font-semibold text-stone-900 truncate">{booking.therapistName}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200 flex items-center gap-2 text-stone-500">
            <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">E-mail: <strong>{booking.clientEmail}</strong></span>
          </div>
        </div>

        {/* Confirmation status box */}
        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-1 mb-5">
          <div className="flex items-center gap-2 font-bold">
            <Database className="w-4 h-4 text-emerald-700" />
            <span>
              {syncedToSupabase
                ? 'Gravado na tabela de agendamentos'
                : 'Salvo com sucesso (Modo Local / Demo)'}
            </span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            Uma notificação automática de confirmação foi enviada para <strong>{booking.clientEmail}</strong>. 
            Você pode acompanhar todos os agendamentos pelo Painel de Agendamentos.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <a
              href={makeGoogleCalendarLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              Google Agenda
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </a>

            <a
              href={makeWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-900 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-700" />
              Enviar WhatsApp
            </a>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => {
                onClose();
                onGoToAdmin();
              }}
              className="flex-1 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Database className="w-4 h-4 text-amber-300" />
              Acessar Painel de Controle
            </button>

            <button
              onClick={onClose}
              className="px-4 py-3 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 font-medium text-xs transition-colors"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

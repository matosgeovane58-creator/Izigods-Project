import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { MassageSelector } from './components/MassageSelector.tsx';
import { TherapistSelector } from './components/TherapistSelector.tsx';
import { CalendarPicker } from './components/CalendarPicker.tsx';
import { BookingForm } from './components/BookingForm.tsx';
import { BookingConfirmationModal } from './components/BookingConfirmationModal.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { TherapistsView } from './components/TherapistsView.tsx';
import { MASSAGE_TYPES, THERAPISTS, INITIAL_NOTIFICATIONS } from './data/massageData.ts';
import { MassageType, Therapist, Booking, AppNotification, SupabaseConfigStatus } from './types.ts';
import { getBookings, createBooking, updateBookingStatus, checkSupabaseStatus } from './lib/supabase.ts';
import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'booking' | 'admin' | 'therapists'>('booking');

  // Booking process state
  const [selectedMassage, setSelectedMassage] = useState<MassageType>(MASSAGE_TYPES[0]);
  const [selectedDuration, setSelectedDuration] = useState<number>(MASSAGE_TYPES[0].durations[0].minutes);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);

  // Default date to tomorrow (YYYY-MM-DD)
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTomorrowDate());
  const [selectedTime, setSelectedTime] = useState<string>('14:30');

  // App data state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseConfigStatus>({
    isConfigured: false,
    hasAnonKey: false,
    hasServiceKey: false,
    webhookUrlConfigured: false,
  });

  // Modal states
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSyncedToSupabase, setLastSyncedToSupabase] = useState(false);

  // In-app toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial load
  useEffect(() => {
    async function loadData() {
      const [bookingsData, statusData] = await Promise.all([
        getBookings(),
        checkSupabaseStatus(),
      ]);
      setBookings(bookingsData.bookings);
      setSupabaseStatus(statusData);
    }
    loadData();
  }, []);

  const handleRefreshBookings = async () => {
    const { bookings: list } = await getBookings();
    setBookings(list);
    showToast('Lista de agendamentos atualizada!');
  };

  const handleRefreshSupabaseStatus = async () => {
    const status = await checkSupabaseStatus();
    setSupabaseStatus(status);
    showToast(status.isConfigured ? 'Supabase conectado com sucesso!' : 'Status verificado (Modo Local).');
  };

  const handleSelectTherapistForBooking = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    setActiveTab('booking');
    showToast(`Profissional ${therapist.name} selecionado(a)!`);
  };

  const handleBookingSubmit = async (clientData: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    notes: string;
  }) => {
    setIsSubmitting(true);
    try {
      const price = selectedMassage.durations.find(d => d.minutes === selectedDuration)?.price 
        || selectedMassage.durations[0].price;

      const result = await createBooking({
        clientName: clientData.clientName,
        clientEmail: clientData.clientEmail,
        clientPhone: clientData.clientPhone,
        massageId: selectedMassage.id,
        massageName: selectedMassage.name,
        therapistId: selectedTherapist ? selectedTherapist.id : 'any',
        therapistName: selectedTherapist ? selectedTherapist.name : 'Qualquer Profissional Disponível',
        date: selectedDate,
        time: selectedTime,
        durationMinutes: selectedDuration,
        price,
        notes: clientData.notes,
        status: 'confirmado',
      });

      // Update state
      setBookings(prev => [result.booking, ...prev]);
      setConfirmedBooking(result.booking);
      setLastSyncedToSupabase(result.syncedToSupabase);
      setIsConfirmationModalOpen(true);

      // Create confirmation notification
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: 'Nova Sessão Agendada',
        message: `${clientData.clientName} agendou ${selectedMassage.name} para o dia ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')} às ${selectedTime}. Automação disparada para ${clientData.clientEmail}.`,
        timestamp: 'Agora mesmo',
        read: false,
        type: 'booking_created',
        bookingId: result.booking.id,
      };
      setNotifications(prev => [newNotif, ...prev]);

      showToast('Agendamento registrado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao agendar:', err);
      showToast('Ocorreu um erro ao salvar o agendamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'confirmado' | 'pendente' | 'cancelado') => {
    await updateBookingStatus(id, status);
    setBookings(prev => prev.map(b => (b.id === id ? { ...b, status } : b)));
    showToast(`Status do agendamento atualizado para ${status}.`);
  };

  const handleSendTestNotification = (booking: Booking) => {
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Notificação Reenviada',
      message: `Comprovante reenviado com sucesso para ${booking.clientEmail} referente à sessão de ${booking.massageName}.`,
      timestamp: 'Agora mesmo',
      read: false,
      type: 'automation',
      bookingId: booking.id,
    };
    setNotifications(prev => [notif, ...prev]);
    showToast(`Notificação reenviada para ${booking.clientEmail}!`);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-900 flex flex-col selection:bg-emerald-800 selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-stone-700 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        isNotificationsOpen={isNotificationsOpen}
        setIsNotificationsOpen={setIsNotificationsOpen}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === 'booking' && (
          <div className="space-y-12 animate-in fade-in duration-200">
            {/* Step 1: Massage Selector */}
            <MassageSelector
              selectedMassage={selectedMassage}
              onSelectMassage={setSelectedMassage}
              selectedDuration={selectedDuration}
              onSelectDuration={setSelectedDuration}
            />

            {/* Step 2: Therapist Selector */}
            <TherapistSelector
              selectedTherapistId={selectedTherapist ? selectedTherapist.id : 'any'}
              onSelectTherapist={setSelectedTherapist}
            />

            {/* Step 3: Interactive Calendar & Time Slots */}
            <CalendarPicker
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
              existingBookings={bookings}
              therapistId={selectedTherapist ? selectedTherapist.id : 'any'}
            />

            {/* Step 4: Client Info Form & Confirmation */}
            <BookingForm
              selectedMassage={selectedMassage}
              selectedTherapist={selectedTherapist}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedDuration={selectedDuration}
              onSubmitBooking={handleBookingSubmit}
              isLoading={isSubmitting}
            />
          </div>
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            bookings={bookings}
            supabaseStatus={supabaseStatus}
            onRefreshBookings={handleRefreshBookings}
            onUpdateStatus={handleUpdateStatus}
            onSendTestNotification={handleSendTestNotification}
          />
        )}

        {activeTab === 'therapists' && (
          <TherapistsView
            onSelectTherapistForBooking={handleSelectTherapistForBooking}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-white/50 py-8 text-xs text-stone-500 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-900 text-sm">Zenith Massoterapia</span>
            <span>— Sistema de Agendamentos</span>
          </div>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Automação de Confirmação</span>
            <span>•</span>
            <span>Calendário Interativo</span>
            <span>•</span>
            <span>Gestão Completa</span>
          </div>
        </div>
      </footer>

      {/* Booking Confirmation Receipt Modal */}
      <BookingConfirmationModal
        booking={confirmedBooking}
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onGoToAdmin={() => setActiveTab('admin')}
        syncedToSupabase={lastSyncedToSupabase}
      />
    </div>
  );
}

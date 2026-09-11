import React from 'react';
import { Sparkles, Calendar, Database, Users, Bell } from 'lucide-react';
import { AppNotification, SupabaseConfigStatus } from '../types.ts';

interface HeaderProps {
  activeTab: 'booking' | 'admin' | 'therapists';
  setActiveTab: (tab: 'booking' | 'admin' | 'therapists') => void;
  supabaseStatus?: SupabaseConfigStatus;
  onOpenSupabaseModal?: () => void;
  notifications: AppNotification[];
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  onMarkAllNotificationsRead: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  notifications,
  isNotificationsOpen,
  setIsNotificationsOpen,
  onMarkAllNotificationsRead,
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('booking')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-800 to-stone-900 flex items-center justify-center text-amber-100 shadow-sm border border-emerald-700/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold tracking-tight text-stone-900">
                  Zenith Massoterapia
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Spa & Saúde
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">Equilíbrio, Bem-Estar e Terapias Corporais</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center p-1.5 bg-stone-100/90 rounded-2xl border border-stone-200 text-sm font-medium">
            <button
              onClick={() => setActiveTab('booking')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'booking'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Calendar className="w-4 h-4 text-emerald-700" />
              Agendar Massagem
            </button>
            <button
              onClick={() => setActiveTab('therapists')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'therapists'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-700" />
              Terapeutas
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-700" />
              Painel de Agendamentos
            </button>
          </nav>

          {/* Right Actions: Notifications */}
          <div className="flex items-center gap-2.5">
            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                aria-label="Abrir notificações"
                className="relative p-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors border border-stone-200"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-stone-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-2">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-700" />
                      <h4 className="font-semibold text-stone-900 text-sm">Notificações</h4>
                      <span className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                        {notifications.length}
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllNotificationsRead}
                        className="text-xs text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
                      >
                        Marcar lidas
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-center py-6 text-xs text-stone-400">Nenhuma notificação no momento.</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl border text-xs transition-all ${
                            n.read
                              ? 'bg-stone-50/70 border-stone-200/60 text-stone-600'
                              : 'bg-emerald-50/50 border-emerald-200 text-stone-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                              {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                              {n.title}
                            </span>
                            <span className="text-[10px] text-stone-400">{n.timestamp}</span>
                          </div>
                          <p className="leading-relaxed text-stone-600">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-stone-200/60 text-xs">
          <button
            onClick={() => setActiveTab('booking')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-medium ${
              activeTab === 'booking' ? 'bg-stone-200 text-stone-900' : 'text-stone-500'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Agendar
          </button>
          <button
            onClick={() => setActiveTab('therapists')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-medium ${
              activeTab === 'therapists' ? 'bg-stone-200 text-stone-900' : 'text-stone-500'
            }`}
          >
            <Users className="w-4 h-4" />
            Terapeutas
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-medium ${
              activeTab === 'admin' ? 'bg-stone-200 text-stone-900' : 'text-stone-500'
            }`}
          >
            <Database className="w-4 h-4" />
            Agendamentos
          </button>
        </div>
      </div>
    </header>
  );
};

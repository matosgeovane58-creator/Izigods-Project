import React, { useState } from 'react';
import { Database, Search, Filter, CheckCircle2, Clock, XCircle, RefreshCw, Send, Copy, Check, ExternalLink, ShieldCheck, AlertCircle, FileCode, Play } from 'lucide-react';
import { Booking, SupabaseConfigStatus } from '../types.ts';
import { SUPABASE_SQL_SETUP, AUTOMATION_GUIDE } from '../lib/supabase.ts';

interface AdminPanelProps {
  bookings: Booking[];
  supabaseStatus: SupabaseConfigStatus;
  onRefreshBookings: () => Promise<void>;
  onUpdateStatus: (id: string, status: 'confirmado' | 'pendente' | 'cancelado') => Promise<void>;
  onOpenSupabaseModal?: () => void;
  onSendTestNotification: (booking: Booking) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  bookings,
  supabaseStatus,
  onRefreshBookings,
  onUpdateStatus,
  onSendTestNotification,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmado' | 'pendente' | 'cancelado'>('all');
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'supabase_guide'>('list');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [webhookTestStatus, setWebhookTestStatus] = useState<string | null>(null);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshBookings();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleTestWebhook = async () => {
    setWebhookTestStatus('Enviando...');
    try {
      const res = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sample: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWebhookTestStatus('Webhook disparado com sucesso! Verifique seu receptor de automação.');
      } else {
        setWebhookTestStatus(data.error || 'Nenhuma URL de webhook configurada em CONFIRMATION_WEBHOOK_URL.');
      }
    } catch (e: any) {
      setWebhookTestStatus('Erro: ' + e.message);
    }
  };

  // Filter appointments
  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.massageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.therapistName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalBookings = bookings.length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmado').length;
  const totalRevenue = bookings
    .filter(b => b.status !== 'cancelado')
    .reduce((acc, b) => acc + b.price, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-sans">
              Gestão e Controle
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
              supabaseStatus.isConfigured 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {supabaseStatus.isConfigured ? 'Supabase Conectado' : 'Modo Demonstração'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">
            Painel de Controle de Agendamentos
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Gerencie reservas, sincronize com o Supabase e configure gatilhos para automações de e-mail e WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
            Total de Sessões
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-stone-900">{totalBookings}</span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Ativas
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
            Confirmados
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-emerald-800">{confirmedCount}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
            Faturamento Estimado
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-stone-900">
              R$ {totalRevenue.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs font-medium text-stone-500">Mês Atual</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
            Status da Tabela Supabase
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-3 h-3 rounded-full ${supabaseStatus.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-sm font-bold text-stone-900">
              {supabaseStatus.isConfigured ? 'Tabela: agendamentos' : 'Local Storage'}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {supabaseStatus.isConfigured ? 'Sincronização em tempo real ativa' : 'Pronto para conectar seu projeto'}
          </p>
        </div>
      </div>

      {/* Sub tabs: Bookings Table vs Automation Guide */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-sm font-medium">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'list'
              ? 'bg-stone-900 text-white font-semibold shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          Lista de Agendamentos ({filteredBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('supabase_guide')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'supabase_guide'
              ? 'bg-emerald-800 text-white font-semibold shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-amber-300" />
          Script SQL & Automação
        </button>
      </div>

      {activeTab === 'list' ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          {/* Filters & Search bar */}
          <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por cliente, e-mail, massagem..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50/60 focus:bg-white"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
              <span className="text-stone-400 font-medium mr-1 hidden sm:inline flex items-center gap-1">
                <Filter className="w-3 h-3" /> Status:
              </span>
              {(['all', 'confirmado', 'pendente', 'cancelado'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                    statusFilter === st
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {st === 'all' ? 'Todos' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50/70 border-b border-stone-100 text-stone-400 uppercase tracking-wider text-[10px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Massagem</th>
                  <th className="py-3 px-4">Profissional</th>
                  <th className="py-3 px-4">Data e Hora</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-stone-400">
                      Nenhum agendamento encontrado com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map(b => (
                    <tr key={b.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-900">{b.clientName}</div>
                        <div className="text-[11px] text-stone-400">{b.clientEmail}</div>
                        {b.clientPhone && (
                          <div className="text-[10px] text-stone-400">{b.clientPhone}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-900">{b.massageName}</div>
                        <div className="text-[11px] text-stone-400">{b.durationMinutes} minutos</div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-stone-800">
                        {b.therapistName}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-stone-900">
                          {new Date(b.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-[11px] text-stone-500 font-semibold">{b.time}</div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-stone-900">
                        R$ {b.price}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          b.status === 'confirmado'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : b.status === 'pendente'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {b.status === 'confirmado' && <CheckCircle2 className="w-3 h-3" />}
                          {b.status === 'pendente' && <Clock className="w-3 h-3" />}
                          {b.status === 'cancelado' && <XCircle className="w-3 h-3" />}
                          {b.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status !== 'confirmado' && (
                            <button
                              onClick={() => onUpdateStatus(b.id, 'confirmado')}
                              title="Confirmar Agendamento"
                              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {b.status !== 'cancelado' && (
                            <button
                              onClick={() => onUpdateStatus(b.id, 'cancelado')}
                              title="Cancelar Agendamento"
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => onSendTestNotification(b)}
                            title="Reenviar Notificação de Confirmação"
                            className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 border border-stone-200 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Supabase & Automation Setup Guide */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-6 h-6 text-emerald-700" />
              <h3 className="font-serif font-bold text-xl text-stone-900">
                Automação de Confirmação com Supabase
              </h3>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed max-w-3xl">
              Ao conectar o Supabase, cada agendamento inserido na tabela <code>agendamentos</code> pode disparar 
              automaticamente um <strong>Database Webhook</strong> ou uma <strong>Edge Function</strong> para enviar e-mails de confirmação (via Resend/SendGrid) ou mensagens de WhatsApp (via Z-API/Evolution).
            </p>
          </div>

          {/* 4 Steps Guide */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AUTOMATION_GUIDE.steps.map(s => (
              <div key={s.step} className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs font-bold flex items-center justify-center">
                  {s.step}
                </span>
                <h4 className="font-serif font-bold text-base text-stone-900">
                  {s.title}
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>

          {/* SQL Script Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Script SQL da Tabela agendamentos
                </h4>
              </div>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>Copiar SQL</span>
                  </>
                )}
              </button>
            </div>

            <pre className="bg-stone-950 text-emerald-300 p-4 rounded-2xl text-xs overflow-x-auto font-mono max-h-60 leading-relaxed border border-stone-800">
              {SUPABASE_SQL_SETUP}
            </pre>
          </div>

          {/* Test Automation Dispatch Button */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h5 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-700" />
                Testar Disparo de Automação
              </h5>
              <p className="text-xs text-emerald-800 mt-1">
                Dispara um evento de teste para o endpoint configurado em <code>CONFIRMATION_WEBHOOK_URL</code> no arquivo <code>.env</code>.
              </p>
              {webhookTestStatus && (
                <p className="text-xs font-semibold text-emerald-950 mt-2 bg-emerald-100/80 p-2 rounded-lg inline-block">
                  {webhookTestStatus}
                </p>
              )}
            </div>

            <button
              onClick={handleTestWebhook}
              className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition-colors shrink-0 shadow-xs"
            >
              Disparar Webhook Teste
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

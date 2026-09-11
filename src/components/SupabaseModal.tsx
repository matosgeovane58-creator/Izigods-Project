import React, { useState } from 'react';
import { Database, Check, Copy, X, Key, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, Sparkles } from 'lucide-react';
import { SupabaseConfigStatus } from '../types.ts';
import { SUPABASE_SQL_SETUP, AUTOMATION_GUIDE } from '../lib/supabase.ts';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: SupabaseConfigStatus;
  onRefreshStatus: () => Promise<void>;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefreshStatus,
}) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCopyEnv = () => {
    const envText = `SUPABASE_URL=https://seu-projeto.supabase.co\nSUPABASE_ANON_KEY=sua-chave-anon\nSUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role\nCONFIRMATION_WEBHOOK_URL=https://seu-endpoint-de-automacao.com/webhook`;
    navigator.clipboard.writeText(envText);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const handleCheckStatus = async () => {
    setIsRefreshing(true);
    await onRefreshStatus();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-stone-900">
              Conexão com Supabase & Automação
            </h3>
            <p className="text-xs text-stone-500">
              Armazenamento em banco de dados relacional e acionamento de automações.
            </p>
          </div>
        </div>

        {/* Current status banner */}
        <div className={`p-4 rounded-2xl border mb-6 flex items-start justify-between gap-3 text-xs ${
          status.isConfigured
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            : 'bg-amber-50/70 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-start gap-2.5">
            {status.isConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block text-sm">
                {status.isConfigured ? 'Supabase Conectado' : 'Modo Demonstração (Local Storage)'}
              </span>
              <p className="mt-0.5 text-stone-600 leading-relaxed">
                {status.isConfigured
                  ? `Os agendamentos são persistidos diretamente no seu banco Supabase. URL configurada: ${status.supabaseUrl || 'Ativa'}.`
                  : 'O app está totalmente funcional e salvando localmente. Para persistir no seu projeto Supabase e ativar disparos de confirmação automática, adicione as chaves no arquivo .env.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleCheckStatus}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 transition-colors shrink-0 shadow-xs"
            title="Verificar Conexão"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Step 1: SQL Script */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
              1. Criar Tabela no SQL Editor do Supabase
            </span>
            <button
              onClick={handleCopySql}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
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
          <pre className="bg-stone-950 text-emerald-300 p-3.5 rounded-2xl text-xs overflow-x-auto font-mono max-h-40 leading-relaxed border border-stone-800">
            {SUPABASE_SQL_SETUP}
          </pre>
        </div>

        {/* Step 2: Environment Variables */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
              2. Variáveis de Ambiente (.env)
            </span>
            <button
              onClick={handleCopyEnv}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
            >
              {copiedEnv ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>Copiar Modelo .env</span>
                </>
              )}
            </button>
          </div>
          <div className="p-3 bg-stone-100 rounded-xl font-mono text-xs text-stone-800 space-y-1">
            <div>SUPABASE_URL=https://seu-projeto.supabase.co</div>
            <div>SUPABASE_ANON_KEY=eyJhbGciOi...</div>
            <div>SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...</div>
            <div>CONFIRMATION_WEBHOOK_URL=https://... (opcional)</div>
          </div>
        </div>

        {/* Step 3: Automation Setup Explanation */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
            3. Criando a Automação de Confirmação no Supabase
          </span>
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs text-stone-700 space-y-2">
            <p>
              • No painel do Supabase, acesse <strong>Database</strong> &gt; <strong>Webhooks</strong>.
            </p>
            <p>
              • Crie um webhook na tabela <strong>agendamentos</strong> para o evento <strong>INSERT</strong>.
            </p>
            <p>
              • Aponte para sua URL de automação (Resend, Zapier, Make, n8n ou Edge Function). O Supabase enviará o registro completo com <code>nome_cliente</code>, <code>email_cliente</code>, <code>data_agendamento</code> e <code>horario</code> para envio imediato!
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

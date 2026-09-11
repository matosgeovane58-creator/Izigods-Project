import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Booking, SupabaseConfigStatus } from '../types.ts';
import { INITIAL_BOOKINGS } from '../data/massageData.ts';

const LOCAL_STORAGE_KEY = 'zenith_massage_bookings';

// Retrieve environment variables safely
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClientInstance) return supabaseClientInstance;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
      console.warn('Erro ao inicializar Supabase client no navegador:', e);
    }
  }
  return supabaseClientInstance;
}

export function getLocalStoredBookings(): Booking[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS));
      return INITIAL_BOOKINGS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Falha ao ler localStorage:', e);
    return INITIAL_BOOKINGS;
  }
}

export function saveLocalBookings(bookings: Booking[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.error('Falha ao salvar no localStorage:', e);
  }
}

/**
 * Fetch all bookings, prioritizing backend API (/api/bookings) which connects to Supabase,
 * with graceful fallback to localStorage.
 */
export async function getBookings(): Promise<{ bookings: Booking[]; isLiveSupabase: boolean }> {
  try {
    const res = await fetch('/api/bookings');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.bookings) && data.bookings.length > 0) {
        saveLocalBookings(data.bookings);
        return { bookings: data.bookings, isLiveSupabase: !!data.isLiveSupabase };
      }
    }
  } catch (err) {
    console.warn('API /api/bookings não respondeu, usando storage local:', err);
  }

  // Fallback to local
  const local = getLocalStoredBookings();
  return { bookings: local, isLiveSupabase: false };
}

/**
 * Create a new appointment. Sends to backend /api/bookings which inserts into Supabase
 * and fires confirmation webhook if configured.
 */
export async function createBooking(newBooking: Omit<Booking, 'id' | 'createdAt' | 'syncedToSupabase'>): Promise<{
  booking: Booking;
  syncedToSupabase: boolean;
  webhookSent: boolean;
}> {
  const generatedId = `bk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const fullBooking: Booking = {
    ...newBooking,
    id: generatedId,
    createdAt: new Date().toISOString(),
    syncedToSupabase: false,
  };

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullBooking),
    });

    if (res.ok) {
      const result = await res.json();
      const savedBooking: Booking = result.booking || fullBooking;
      savedBooking.syncedToSupabase = result.syncedToSupabase ?? false;

      // Update local storage too
      const current = getLocalStoredBookings();
      const updated = [savedBooking, ...current];
      saveLocalBookings(updated);

      return {
        booking: savedBooking,
        syncedToSupabase: !!result.syncedToSupabase,
        webhookSent: !!result.webhookSent,
      };
    }
  } catch (err) {
    console.warn('Backend API indisponível, gravando localmente:', err);
  }

  // Local fallback
  const current = getLocalStoredBookings();
  const updated = [fullBooking, ...current];
  saveLocalBookings(updated);

  return {
    booking: fullBooking,
    syncedToSupabase: false,
    webhookSent: false,
  };
}

/**
 * Update an appointment's status (e.g. confirmado, cancelado)
 */
export async function updateBookingStatus(id: string, status: 'confirmado' | 'pendente' | 'cancelado'): Promise<boolean> {
  let backendSuccess = false;
  try {
    const res = await fetch(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      backendSuccess = true;
    }
  } catch (e) {
    console.warn('Erro ao atualizar status via API:', e);
  }

  // Update in local storage
  const current = getLocalStoredBookings();
  const updated = current.map(b => (b.id === id ? { ...b, status } : b));
  saveLocalBookings(updated);

  return backendSuccess;
}

/**
 * Check backend connection status and whether Supabase is configured
 */
export async function checkSupabaseStatus(): Promise<SupabaseConfigStatus> {
  try {
    const res = await fetch('/api/status');
    if (res.ok) {
      const data = await res.json();
      return {
        isConfigured: !!data.hasSupabaseUrl && (!!data.hasAnonKey || !!data.hasServiceKey),
        supabaseUrl: data.supabaseUrl || '',
        hasAnonKey: !!data.hasAnonKey,
        hasServiceKey: !!data.hasServiceKey,
        webhookUrlConfigured: !!data.hasWebhookUrl,
      };
    }
  } catch (e) {
    console.warn('Não foi possível verificar status da API:', e);
  }

  const clientHasKeys = !!(supabaseUrl && supabaseAnonKey);
  return {
    isConfigured: clientHasKeys,
    supabaseUrl: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    hasServiceKey: false,
    webhookUrlConfigured: false,
  };
}

/**
 * SQL script for the user to execute in the Supabase SQL Editor
 */
export const SUPABASE_SQL_SETUP = `-- =======================================================
-- SCRIPT DE CRIAÇÃO DA TABELA NO SUPABASE
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/_/sql/new
-- =======================================================

-- 1. Criar a tabela de agendamentos
create table if not exists public.agendamentos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  nome_cliente text not null,
  email_cliente text not null,
  telefone_cliente text,
  tipo_massagem text not null,
  duracao integer not null,
  preco numeric(10,2) not null,
  profissional text not null,
  data_agendamento date not null,
  horario text not null,
  status text default 'confirmado' not null,
  observacoes text
);

-- 2. Habilitar segurança em nível de linha (RLS)
alter table public.agendamentos enable row level security;

-- 3. Política para inserção pública (permite que qualquer cliente agende online)
create policy "Permitir criacao de agendamentos"
  on public.agendamentos for insert
  with check (true);

-- 4. Política para leitura de agendamentos
create policy "Permitir leitura de agendamentos"
  on public.agendamentos for select
  using (true);

-- 5. Política para atualização de status de agendamentos
create policy "Permitir atualizacao de agendamentos"
  on public.agendamentos for update
  using (true);

-- 6. Índice para consultas rápidas por data e profissional
create index if not exists idx_agendamentos_data on public.agendamentos(data_agendamento);
create index if not exists idx_agendamentos_email on public.agendamentos(email_cliente);
`;

export const AUTOMATION_GUIDE = {
  title: 'Como criar a automação de confirmação no Supabase',
  steps: [
    {
      step: 1,
      title: 'Acesse o Supabase Dashboard',
      description: 'Entre no seu projeto no Supabase (supabase.com) e vá em "Database" > "Webhooks" (ou "Edge Functions").',
    },
    {
      step: 2,
      title: 'Crie um Database Webhook',
      description: 'Clique em "Create Webhook". Nomeie como "confirmacao_agendamento", selecione a tabela "public.agendamentos" e o evento "INSERT".',
    },
    {
      step: 3,
      title: 'Conecte ao seu serviço de e-mail / automação',
      description: 'No campo URL do Webhook, insira o endpoint do seu n8n, Zapier, Make, Resend ou Edge Function. Quando um novo agendamento for criado, o Supabase enviará instantaneamente o payload com nome, dia, hora e e-mail do cliente!',
    },
    {
      step: 4,
      title: 'Template de Notificação Automática',
      description: 'No seu disparador (ex: Resend ou WhatsApp), configure o e-mail: "Olá {record.nome_cliente}, sua {record.tipo_massagem} está confirmada para o dia {record.data_agendamento} às {record.horario} com {record.profissional}!"',
    },
  ],
};

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory fallback database for bookings
let inMemoryBookings: any[] = [
  {
    id: 'bk-202609-001',
    clientName: 'Mariana Azevedo',
    clientEmail: 'mariana.azevedo@gmail.com',
    clientPhone: '(11) 98745-1234',
    massageId: 'pedras-quentes',
    massageName: 'Massagem com Pedras Quentes',
    therapistId: 'dra-beatriz-santos',
    therapistName: 'Dra. Beatriz Santos',
    date: '2026-09-12',
    time: '14:30',
    durationMinutes: 60,
    price: 210,
    notes: 'Muita tensão na região dos ombros e cervical. Preferência por óleo aquecido.',
    status: 'confirmado',
    createdAt: new Date().toISOString(),
    syncedToSupabase: false,
  },
  {
    id: 'bk-202609-002',
    clientName: 'Rodrigo Fontes',
    clientEmail: 'rodrigo.fontes@empresa.com.br',
    clientPhone: '(11) 99123-7890',
    massageId: 'terapeutica-miofascial',
    massageName: 'Massagem Terapêutica & Miofascial',
    therapistId: 'dra-camila-duarte',
    therapistName: 'Dra. Camila Duarte',
    date: '2026-09-13',
    time: '10:30',
    durationMinutes: 50,
    price: 190,
    notes: 'Dor lombar após maratona no último domingo.',
    status: 'confirmado',
    createdAt: new Date().toISOString(),
    syncedToSupabase: false,
  },
];

// Lazy Supabase Client setup
let supabaseClient: SupabaseClient | null = null;
function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (url && key) {
    if (!supabaseClient) {
      try {
        supabaseClient = createClient(url, key, {
          auth: { persistSession: false },
        });
        console.log('[Supabase] Cliente inicializado com sucesso para:', url);
      } catch (err) {
        console.error('[Supabase] Erro na inicialização:', err);
        supabaseClient = null;
      }
    }
    return supabaseClient;
  }
  return null;
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/status', (_req, res) => {
  const supabase = getSupabase();
  const rawUrl = process.env.SUPABASE_URL || '';
  res.json({
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasWebhookUrl: !!process.env.CONFIRMATION_WEBHOOK_URL,
    supabaseUrl: rawUrl,
    isClientConnected: !!supabase,
  });
});

// GET /api/bookings - Lists all appointments from Supabase (or fallback)
app.get('/api/bookings', async (_req, res) => {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .order('data_agendamento', { ascending: false });

      if (!error && Array.isArray(data)) {
        // Map Supabase columns to Booking interface
        const mapped = data.map(item => ({
          id: item.id?.toString() || `sb-${Date.now()}`,
          clientName: item.nome_cliente || 'Cliente',
          clientEmail: item.email_cliente || '',
          clientPhone: item.telefone_cliente || '',
          massageId: item.tipo_massagem?.toLowerCase().replace(/\s+/g, '-') || 'relaxante',
          massageName: item.tipo_massagem || 'Massagem',
          therapistId: item.profissional?.toLowerCase().replace(/\s+/g, '-') || 'terapeuta',
          therapistName: item.profissional || 'Profissional',
          date: item.data_agendamento || '',
          time: item.horario || '',
          durationMinutes: Number(item.duracao) || 60,
          price: Number(item.preco) || 0,
          notes: item.observacoes || '',
          status: item.status || 'confirmado',
          createdAt: item.created_at || new Date().toISOString(),
          syncedToSupabase: true,
        }));

        return res.json({
          bookings: mapped,
          isLiveSupabase: true,
          count: mapped.length,
        });
      } else {
        console.warn('[Supabase] Tabela "agendamentos" não encontrada ou erro na consulta:', error?.message);
      }
    } catch (e: any) {
      console.error('[Supabase] Exceção na busca:', e.message);
    }
  }

  // Fallback to in-memory bookings
  res.json({
    bookings: inMemoryBookings,
    isLiveSupabase: false,
    count: inMemoryBookings.length,
  });
});

// POST /api/bookings - Creates an appointment in Supabase and triggers automation
app.post('/api/bookings', async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      massageName,
      massageId,
      therapistName,
      therapistId,
      date,
      time,
      durationMinutes,
      price,
      notes,
    } = req.body;

    if (!clientName || !clientEmail || !date || !time || !massageName) {
      return res.status(400).json({
        error: 'Campos obrigatórios ausentes: nome, e-mail, data, hora e massagem são requeridos.',
      });
    }

    const bookingId = `bk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newBooking = {
      id: bookingId,
      clientName,
      clientEmail,
      clientPhone: clientPhone || '',
      massageId: massageId || 'massagem',
      massageName,
      therapistId: therapistId || 'qualquer',
      therapistName: therapistName || 'Profissional Disponível',
      date,
      time,
      durationMinutes: durationMinutes || 60,
      price: price || 160,
      notes: notes || '',
      status: 'confirmado',
      createdAt: new Date().toISOString(),
      syncedToSupabase: false,
    };

    let syncedToSupabase = false;
    let webhookSent = false;
    const supabase = getSupabase();

    // 1. Insert into Supabase table 'agendamentos'
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('agendamentos')
          .insert([
            {
              nome_cliente: clientName,
              email_cliente: clientEmail,
              telefone_cliente: clientPhone || null,
              tipo_massagem: massageName,
              duracao: durationMinutes || 60,
              preco: price || 160,
              profissional: therapistName || 'Profissional Disponível',
              data_agendamento: date,
              horario: time,
              status: 'confirmado',
              observacoes: notes || null,
            },
          ])
          .select()
          .single();

        if (!error) {
          syncedToSupabase = true;
          if (data && data.id) {
            newBooking.id = data.id.toString();
          }
          console.log('[Supabase] Agendamento gravado com sucesso:', newBooking.id);
        } else {
          console.error('[Supabase] Erro no insert:', error.message);
        }
      } catch (err: any) {
        console.error('[Supabase] Exceção ao gravar no banco:', err.message);
      }
    }

    // 2. Trigger external confirmation webhook if configured
    const webhookUrl = process.env.CONFIRMATION_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Zenith-Massage-Booking-Automation/1.0',
          },
          body: JSON.stringify({
            event: 'booking.created',
            timestamp: new Date().toISOString(),
            appointment: newBooking,
            automation: {
              type: 'confirmation_email',
              recipient: clientEmail,
              message: `Olá ${clientName}, seu agendamento de ${massageName} está confirmado para o dia ${date} às ${time} com ${therapistName}.`,
            },
          }),
        });
        if (webhookResponse.ok) {
          webhookSent = true;
          console.log('[Automation Webhook] Disparo executado com sucesso para:', webhookUrl);
        }
      } catch (webhookErr: any) {
        console.warn('[Automation Webhook] Falha ao acionar webhook:', webhookErr.message);
      }
    }

    newBooking.syncedToSupabase = syncedToSupabase;
    inMemoryBookings.unshift(newBooking);

    res.status(201).json({
      success: true,
      booking: newBooking,
      syncedToSupabase,
      webhookSent,
      message: syncedToSupabase
        ? 'Agendamento salvo no Supabase com sucesso!'
        : 'Agendamento registrado com sucesso (modo local).',
    });
  } catch (error: any) {
    console.error('Erro ao processar agendamento:', error);
    res.status(500).json({ error: error.message || 'Erro interno no servidor' });
  }
});

// PATCH /api/bookings/:id/status - Update booking status
app.patch('/api/bookings/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status não informado' });
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('agendamentos').update({ status }).eq('id', id);
    } catch (e) {
      console.warn('Erro ao atualizar no Supabase:', e);
    }
  }

  // Update in memory
  inMemoryBookings = inMemoryBookings.map(b => (b.id === id ? { ...b, status } : b));

  res.json({ success: true, id, status });
});

// POST /api/test-webhook - Test automation dispatch
app.post('/api/test-webhook', async (req, res) => {
  const webhookUrl = req.body.url || process.env.CONFIRMATION_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(400).json({ error: 'Nenhuma URL de webhook informada' });
  }

  try {
    const testPayload = {
      event: 'test_confirmation',
      timestamp: new Date().toISOString(),
      sampleBooking: {
        id: 'test-preview-123',
        clientName: 'Cliente Teste',
        clientEmail: 'teste@exemplo.com',
        massageName: 'Massagem Relaxante Clássica',
        therapistName: 'Dra. Camila Duarte',
        date: '2026-09-15',
        time: '15:00',
        price: 160,
      },
    };

    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    });

    res.json({
      success: resp.ok,
      statusCode: resp.status,
      message: resp.ok ? 'Webhook disparado e recebido com sucesso!' : `Erro ao disparar: Status ${resp.status}`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// Vite Middleware / Production Static Serve
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Sistema de Agendamentos rodando na porta ${PORT} (0.0.0.0)`);
  });
}

startServer();

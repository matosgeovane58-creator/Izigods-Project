export interface MassageType {
  id: string;
  name: string;
  category: 'Relaxamento' | 'Terapêutica' | 'Estética' | 'Oriental';
  tagline: string;
  description: string;
  benefits: string[];
  durations: {
    minutes: number;
    price: number;
  }[];
  intensity: 'Suave' | 'Média' | 'Firme' | 'Intensa';
  icon: string;
  image: string;
}

export interface Therapist {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  specialties: string[];
  availableDays: number[]; // 0=Sunday, 1=Monday ... 6=Saturday
}

export interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  massageId: string;
  massageName: string;
  therapistId: string;
  therapistName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number;
  price: number;
  notes?: string;
  status: 'confirmado' | 'pendente' | 'cancelado';
  createdAt: string;
  syncedToSupabase: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'booking_created' | 'booking_confirmed' | 'reminder' | 'cancellation' | 'automation';
  bookingId?: string;
}

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  supabaseUrl?: string;
  hasAnonKey: boolean;
  hasServiceKey: boolean;
  webhookUrlConfigured: boolean;
}

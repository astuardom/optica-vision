import { createClient } from '@supabase/supabase-js';

// Reemplazar estas variables con las que te proporcione Supabase.
// Idealmente deberían venir de .env, ej: import.meta.env.VITE_SUPABASE_URL
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'TU_SUPABASE_URL_AQUI';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'TU_SUPABASE_ANON_KEY_AQUI';

export const supabase = createClient(supabaseUrl, supabaseKey);

// AUTH
export const loginAdmin = async (email: string, pass: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
  if (error) {
    console.error('Supabase login error:', {
      message: error.message,
      status: error.status,
      name: error.name,
    });
    throw error;
  }
  return data;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// FIRESTORE -> SUPABASE CITAS
export const saveAppointment = async (appointment: any) => {
  const { data, error } = await supabase
    .from('appointments')
    .insert([
      {
        ...appointment,
        status: 'pendiente',
        createdAt: new Date().toISOString()
      }
    ]);
  if (error) throw error;
  return data;
};

export const getAppointments = async () => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('fecha', { ascending: false });
  if (error) throw error;
  return data;
};

export const updateAppointmentStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
  return data;
};

// FIRESTORE -> SUPABASE COTIZACIONES
export const saveQuote = async (quote: any) => {
  const { data, error } = await supabase
    .from('quotes')
    .insert([
      {
        ...quote,
        status: 'Pendiente',
        createdAt: new Date().toISOString()
      }
    ]);
  if (error) throw error;
  return data;
};

export const getQuotes = async () => {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('createdAt', { ascending: false });
  if (error) throw error;
  return data;
};

export const updateQuoteStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('quotes')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
  return data;
};

// FIRESTORE -> SUPABASE MENSAJES DE CONTACTO
export const saveContactMessage = async (formData: { nombre: string; email: string; mensaje: string }) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        ...formData,
        date: new Date().toISOString(),
        status: 'new',
        createdAt: new Date().toISOString()
      }
    ]);
  if (error) throw error;
  return data;
};

// Subscribirse a mensajes en tiempo real (Equivalente a onSnapshot de Firestore)
export const subscribeToMessages = (callback: (messages: any[]) => void) => {
  // Primero, obtenemos los mensajes iniciales
  supabase
    .from('messages')
    .select('*')
    .order('date', { ascending: false })
    .then(({ data }) => {
      if (data) callback(data);
    });

  // Luego, nos suscribimos a los cambios
  const channel = supabase
    .channel('public:messages')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
      // Al haber un cambio, volvemos a solicitar toda la lista para mantener el orden fácilmente
      // (Opcionalmente, se podría manejar la inserción/actualización en memoria)
      supabase
        .from('messages')
        .select('*')
        .order('date', { ascending: false })
        .then(({ data }) => {
          if (data) callback(data);
        });
    })
    .subscribe();

  // Devolvemos una función para desuscribirse
  return () => {
    supabase.removeChannel(channel);
  };
};

export const updateMessageStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('messages')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
  return data;
};

export const deleteMessage = async (id: string) => {
  const { data, error } = await supabase
    .from('messages')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return data;
};

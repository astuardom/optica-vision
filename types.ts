
export enum Page {
  HOME = 'HOME',
  QUOTE = 'QUOTE',
  RESULT = 'RESULT',
  BOOKING = 'BOOKING',
  CONFIRMATION = 'CONFIRMATION',
  CONTACT = 'CONTACT',
  ABOUT = 'ABOUT',
  LOGIN = 'LOGIN',
  ADMIN = 'ADMIN'
}

export interface Prescription {
  id?: string;
  od_esfera: string;
  od_cilindro: string;
  od_eje: string;
  oi_esfera: string;
  oi_cilindro: string;
  oi_eje: string;
  adicion: string;
  distancia_pupilar: string;
  tipoLente: string;
  material: string;
  nombre?: string;
  telefono?: string;
  email?: string;
  folio?: string;
  whatsappUrl?: string;
  imageUrl?: string;
  createdAt?: any;
  status?: 'Pendiente' | 'Contactado' | 'Finalizado';
}

export interface Appointment {
  id?: string;
  paciente: string;
  fecha: string;
  hora: string;
  tipoAtencion: string;
  especialista: string;
  telefono?: string;
  email?: string;
  notas?: string;
  createdAt?: any;
  status?: 'pendiente' | 'realizado' | 'no_asistio';
}

export interface ContactMessage {
  id?: string;
  nombre: string;
  email: string;
  mensaje: string;
  date: string;
  status: 'new' | 'read' | 'archived';
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

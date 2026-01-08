
import { ServiceItem } from './types';

export const SERVICES: ServiceItem[] = [
  { id: '1', title: 'Lentes Ópticos', description: 'Variedad de marcos y cristales de alta definición para tu receta.', icon: 'eyeglasses' },
  { id: '2', title: 'Lentes de Sol', description: 'Protección UV con estilo y las mejores marcas del mercado.', icon: 'sunny' },
  { id: '3', title: 'Asesoría de Estilo', description: 'Expertos que te ayudan a elegir el marco ideal para tu rostro.', icon: 'face' },
  { id: '4', title: 'Reparaciones', description: 'Ajustes, cambio de plaquetas y mantenimiento preventivo.', icon: 'build' },
];

export const TEAM_MEMBERS = [
  {
    name: 'Ana García',
    role: 'Asesora Óptica Senior',
    bio: 'Especialista en tendencias y selección de cristales de alta gama con 15 años de experiencia.',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=600'
  },
  {
    name: 'Carlos Ruiz',
    role: 'Experto Técnico',
    bio: 'Especialista en montaje de precisión y adaptación de lentes multifocales avanzados.',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600'
  },
  {
    name: 'Sofía Martínez',
    role: 'Asesora de Imagen',
    bio: 'Te ayuda a encontrar el armazón perfecto que resalte tus facciones y estilo personal.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600'
  }
];

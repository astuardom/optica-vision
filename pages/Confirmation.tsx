
import React from 'react';
import { Page, Appointment } from '../types';

interface ConfirmationProps {
  appointment: Appointment | null;
  onNavigate: (page: Page) => void;
}

const Confirmation: React.FC<ConfirmationProps> = ({ appointment, onNavigate }) => {
  if (!appointment) return null;

  return (
    <div className="py-16 px-6 lg:px-40 flex flex-col items-center animate-zoom-in min-h-screen bg-background-light">
      <div className="w-full max-w-[600px] text-center">
        <div className="inline-flex p-5 rounded-full bg-emerald-50 text-emerald-500 mb-8 shadow-sm">
          <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
        </div>
        <h1 className="text-3xl font-black text-text-main mb-3">¡Reserva Confirmada!</h1>
        <p className="text-text-sub mb-10 max-w-md mx-auto font-medium">
          Hemos registrado tu reserva. Un asesor óptico te estará esperando en el horario seleccionado.
        </p>

        <div className="bg-white border border-gray-100 rounded-[32px] shadow-xl overflow-hidden mb-10 text-left">
           <div className="bg-primary/5 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Detalles de la Reserva</span>
              <span className="material-symbols-outlined text-primary text-sm">eyeglasses</span>
           </div>
           <div className="p-8 space-y-4">
              {[
                { label: 'Cliente', value: appointment.paciente },
                { label: 'Fecha', value: appointment.fecha },
                { label: 'Hora', value: `${appointment.hora} hrs` },
                { label: 'Tipo de Visita', value: appointment.tipoAtencion },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-[10px] font-black text-text-sub uppercase tracking-tight">{item.label}</span>
                  <span className="text-sm font-black text-text-main">{item.value}</span>
                </div>
              ))}
              {appointment.notas && (
                <div className="pt-4 border-t border-gray-50">
                   <span className="text-[10px] font-black text-text-sub uppercase block mb-1">Comentarios</span>
                   <p className="text-xs italic text-text-main bg-gray-50 p-3 rounded-lg border border-gray-100">{appointment.notas}</p>
                </div>
              )}
           </div>
        </div>

        <button 
          onClick={() => onNavigate(Page.HOME)}
          className="w-full sm:w-auto px-12 h-16 bg-primary text-white font-black rounded-2xl shadow-lg hover:bg-primary-hover transition-all"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
};

export default Confirmation;

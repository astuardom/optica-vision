
import React, { useMemo, useState } from 'react';
import { Appointment } from '../types';
import { saveAppointment } from '../services/firebaseService';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxdlA9KA0XHYD5xY9ntGGdESSgQC1NK169Ao1an7lfbzCFTjv94nbpVhYgY7u9q2Ljs8A/exec';
const DEFAULT_SLOTS = ['09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00', '18:00'];
const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const Booking: React.FC<{ onSubmit: (data: Appointment) => void }> = ({ onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calendar State
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    tipo_visita: 'Prueba de marcos',
    comentarios: '',
  });

  const daysInMonth = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= lastDate; i++) days.push(new Date(year, month, i));
    return days;
  }, [viewDate]);

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return date < today;
  };

  const isSameDay = (d1: Date, d2: Date | null) => {
    if (!d2) return false;
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;

    setLoading(true);
    try {
      const appointmentData: Appointment = {
        paciente: formData.nombre.trim(),
        fecha: selectedDate.toISOString().split('T')[0],
        hora: selectedSlot,
        tipoAtencion: formData.tipo_visita,
        especialista: 'Asesor de Turno',
        telefono: formData.telefono.trim(),
        email: formData.email.trim(),
        notas: formData.comentarios.trim(),
        status: 'pendiente',
        createdAt: new Date().toISOString(),
      };

      await saveAppointment(appointmentData);
      
      // Notificación opcional vía Apps Script
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action: 'agenda', ...formData, fecha: appointmentData.fecha, hora: appointmentData.hora })
      }).catch(() => {});

      onSubmit(appointmentData);
    } catch (err: any) {
      setErrorMsg('No se pudo completar la reserva. Reintenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-6 lg:px-40 bg-[#F9FBFF] animate-fade-in min-h-screen">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-12 space-y-3">
          <span className="px-3 py-1 bg-primary/10 text-primary font-black rounded-full text-[9px] uppercase tracking-[0.2em]">
            Servicio de Óptica
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-text-main tracking-tight">
            Agenda tu <span className="text-primary">Prueba de Marcos</span>
          </h1>
          <p className="text-text-sub font-medium">Reserva un espacio para recibir asesoría personalizada en tienda.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden p-5">
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-base font-black text-text-main flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">calendar_month</span>
                  {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                </h2>
                <div className="flex gap-1.5">
                  <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center border border-gray-100">
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center border border-gray-100">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 mb-2 text-center text-[8px] font-black uppercase text-text-sub tracking-widest">
                {DAYS_OF_WEEK.map(day => <div key={day}>{day}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((date, i) => {
                  if (!date) return <div key={`empty-${i}`} className="aspect-square"></div>;
                  const active = isSameDay(date, selectedDate);
                  const past = isPast(date);
                  return (
                    <button
                      key={date.getTime()}
                      disabled={past}
                      onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${past ? 'opacity-20 cursor-not-allowed' : 'hover:bg-primary/5'} ${active ? 'bg-primary text-white shadow-md' : 'text-text-main'}`}
                    >
                      <span className="text-xs font-black">{date.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 animate-slide-up">
                 <h3 className="text-sm font-black text-text-main flex items-center gap-2 mb-6">
                   <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                   Selecciona un horario
                 </h3>
                 <div className="grid grid-cols-4 gap-2">
                    {DEFAULT_SLOTS.map(slot => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-3 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all border ${selectedSlot === slot ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-text-sub border-gray-100'}`}
                      >
                        {slot}
                      </button>
                    ))}
                 </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            {selectedSlot ? (
              <div className="bg-white rounded-[32px] shadow-xl border border-primary/5 p-8 animate-zoom-in space-y-6">
                <h3 className="text-lg font-black text-text-main">Tus Datos para la Reserva</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    className="w-full h-12 rounded-xl border-gray-100 px-4 font-bold text-xs focus:ring-primary bg-gray-50/30"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp (+56 9...)"
                    className="w-full h-12 rounded-xl border-gray-100 px-4 font-bold text-xs focus:ring-primary bg-gray-50/30"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    required
                  />
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-text-sub uppercase px-2">Tipo de Visita</label>
                    <select 
                      className="w-full h-12 rounded-xl border-gray-100 px-4 font-bold text-xs focus:ring-primary bg-gray-50/30"
                      value={formData.tipo_visita}
                      onChange={(e) => setFormData({ ...formData, tipo_visita: e.target.value })}
                    >
                      <option>Prueba de marcos</option>
                      <option>Ajuste de lentes / calibración</option>
                      <option>Retiro de lentes</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Comentarios opcionales (ej: marcos que quieres ver)"
                    rows={3}
                    className="w-full rounded-xl border-gray-100 px-4 py-3 font-bold text-xs focus:ring-primary bg-gray-50/30"
                    value={formData.comentarios}
                    onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                  />
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-primary text-white font-black rounded-xl shadow-lg hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'RESERVAR AHORA'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-[32px] p-12 text-center text-text-sub font-bold text-sm">
                Selecciona una fecha y hora para continuar
              </div>
            )}
            {errorMsg && <p className="mt-4 text-center text-red-500 font-bold text-xs">{errorMsg}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;

import React, { useMemo, useState } from 'react';
import { Appointment } from '../types';

interface CalendarViewProps {
  appointments: Appointment[];
  onSelectAppointment: (app: Appointment) => void;
}

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const DAYS_OF_WEEK = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

const CalendarView: React.FC<CalendarViewProps> = ({ appointments, onSelectAppointment }) => {
  const [viewDate, setViewDate] = useState(new Date());

  const { daysInMonth, startPadding, year, month } = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    
    const firstDay = new Date(y, m, 1).getDay(); // 0 = Dom, 1 = Lun, ... 6 = Sab
    // Ajustar para que la semana empiece en Lunes (1) y termine en Domingo (7/0)
    const padding = firstDay === 0 ? 6 : firstDay - 1; 

    const lastDate = new Date(y, m + 1, 0).getDate();
    
    return { daysInMonth: lastDate, startPadding: padding, year: y, month: m };
  }, [viewDate]);

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const handleToday = () => setViewDate(new Date());

  // Generar las celdas del calendario (padding inicial + días del mes + padding final)
  const calendarCells = useMemo(() => {
    const cells: { date: Date | null, isCurrentMonth: boolean, dayNumber: number | null }[] = [];
    
    // Padding anterior
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = startPadding - 1; i >= 0; i--) {
      cells.push({ date: null, isCurrentMonth: false, dayNumber: prevMonthLastDate - i });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ date: new Date(year, month, i), isCurrentMonth: true, dayNumber: i });
    }

    // Padding posterior para completar 35 o 42 celdas
    const remainingCells = (cells.length % 7 === 0) ? 0 : 7 - (cells.length % 7);
    for (let i = 1; i <= remainingCells; i++) {
      cells.push({ date: null, isCurrentMonth: false, dayNumber: i });
    }

    return cells;
  }, [daysInMonth, startPadding, year, month]);

  // Agrupar citas por fecha (formato YYYY-MM-DD)
  const appointmentsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    appointments.forEach(app => {
      if (!map[app.fecha]) map[app.fecha] = [];
      map[app.fecha].push(app);
    });
    // Ordenar por hora en cada día
    Object.keys(map).forEach(date => {
      map[date].sort((a, b) => a.hora.localeCompare(b.hora));
    });
    return map;
  }, [appointments]);

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const getPillColor = (status: string = 'pendiente') => {
    const normalizedStatus = status.trim().toLowerCase();

    if (normalizedStatus === 'realizado') return 'bg-emerald-500 hover:bg-emerald-600';
    if (normalizedStatus === 'pendiente') return 'bg-blue-400 hover:bg-blue-500 opacity-80';
    if (normalizedStatus === 'no_asistio') return 'bg-rose-500 hover:bg-rose-600';
    return 'bg-slate-400 hover:bg-slate-500';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-140px)] animate-fade-in overflow-hidden">
      
      {/* HEADER CALENDARIO */}
      <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-b border-slate-200">
        
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-xl shadow-md">
            <span className="material-symbols-outlined">calendar_month</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Agenda de Citas</h2>
          <button className="ml-4 flex items-center gap-1 text-sm font-bold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
            <span className="material-symbols-outlined text-lg">add</span> Crear
          </button>
        </div>

        <div className="text-xl font-bold text-slate-800 capitalize flex items-center justify-center flex-1">
          {MONTHS[month]} de {year}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleToday} className="px-4 py-1.5 text-sm font-bold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 shadow-sm">
            Hoy
          </button>
          <div className="flex border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <button onClick={handlePrevMonth} className="px-2 py-1.5 hover:bg-slate-50 border-r border-slate-200 text-slate-500">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button onClick={handleNextMonth} className="px-2 py-1.5 hover:bg-slate-50 text-slate-500">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
          <div className="hidden lg:flex border border-slate-200 rounded-lg overflow-hidden shadow-sm ml-2 bg-slate-50">
            <button className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-white border-r border-slate-200 shadow-sm">Mes</button>
            <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 border-r border-slate-200">Semana</button>
            <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800">Día</button>
          </div>
        </div>

      </div>

      {/* GRID CALENDARIO */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
        {/* Cabecera Días */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-white">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="py-2 text-center text-[11px] font-bold text-slate-500 capitalize">
              {day}
            </div>
          ))}
        </div>

        {/* Celdas */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-auto overflow-y-auto">
          {calendarCells.map((cell, index) => {
            const dateStr = cell.date ? cell.date.toISOString().split('T')[0] : '';
            const dayAppointments = dateStr ? (appointmentsByDate[dateStr] || []) : [];
            const today = isToday(cell.date);

            return (
              <div 
                key={index} 
                className={`min-h-[100px] border-b border-r border-slate-200 p-1 flex flex-col ${!cell.isCurrentMonth ? 'bg-slate-50/50' : 'bg-white'}`}
              >
                <div className="flex justify-end mb-1">
                  <span className={`text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full ${today ? 'bg-blue-600 text-white' : !cell.isCurrentMonth ? 'text-slate-400' : 'text-slate-700'}`}>
                    {cell.dayNumber}
                  </span>
                </div>
                
                <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                  {dayAppointments.map(app => (
                    <button
                      key={app.id}
                      onClick={() => onSelectAppointment(app)}
                      className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-sm truncate transition-transform hover:scale-[1.02] ${getPillColor(app.status)}`}
                      title={`${app.hora} - ${app.paciente}`}
                    >
                      {app.hora} {app.paciente.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default CalendarView;

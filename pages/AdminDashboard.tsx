
import React, { useEffect, useMemo, useState } from 'react';
import {
  getQuotes,
  getAppointments,
  logout,
  updateQuoteStatus,
  updateAppointmentStatus,
  subscribeToMessages,
  updateMessageStatus,
  deleteMessage
} from '../services/firebaseService';
import { Prescription, Appointment, Page, ContactMessage } from '../types';

interface AdminDashboardProps {
  onNavigate?: (page: Page) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [quotes, setQuotes] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'quotes' | 'appointments' | 'messages'>('quotes');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuote, setSelectedQuote] = useState<Prescription | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
    const unsubscribeMessages = subscribeToMessages((msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribeMessages();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const q = await getQuotes();
      const a = await getAppointments();
      setQuotes((q as any) || []);
      setAppointments((a as any) || []);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      pendingQuotes: quotes.filter(q => q.status === 'Pendiente').length,
      todayAppointments: appointments.filter(a => a.fecha === today).length,
      newMessages: messages.filter(m => m.status === 'new').length
    };
  }, [quotes, appointments, messages]);

  const handleAppointmentStatus = async (id: string, newStatus: string) => {
    try {
      await updateAppointmentStatus(id, newStatus);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus as any } : a));
      setSelectedAppointment(null);
    } catch (e) {
      alert("Error al actualizar la cita");
    }
  };

  const handleQuoteStatus = async (id: string, newStatus: string) => {
    try {
      await updateQuoteStatus(id, newStatus);
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: newStatus as any } : q));
      setSelectedQuote(null);
    } catch (e) {
      alert("Error al actualizar la cotización");
    }
  };

  const handleMessageStatus = async (id: string, status: string) => {
    try {
      await updateMessageStatus(id, status);
      // El estado de mensajes se actualiza solo vía onSnapshot
      if (selectedMessage) setSelectedMessage(null);
    } catch (e) {
      alert("Error al actualizar el mensaje");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar permanentemente este mensaje?")) {
      try {
        await deleteMessage(id);
        setSelectedMessage(null);
      } catch (e) {
        alert("Error al eliminar el mensaje");
      }
    }
  };

  // Filtrado lógico
  const filteredData = useMemo(() => {
    const s = search.toLowerCase();
    if (activeTab === 'quotes') {
      return quotes.filter(q => {
        const matchesSearch = `${q.nombre || ''} ${q.folio || ''}`.toLowerCase().includes(s);
        const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
    } else if (activeTab === 'appointments') {
      return appointments.filter(a => {
        const matchesSearch = `${a.paciente || ''} ${a.tipoAtencion || ''}`.toLowerCase().includes(s);
        const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
    } else {
      return messages.filter(m => {
        const matchesSearch = `${m.nombre || ''} ${m.email || ''} ${m.mensaje || ''}`.toLowerCase().includes(s);
        const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
    }
  }, [quotes, appointments, messages, activeTab, search, statusFilter]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">Cargando Panel...</span>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row font-sans text-slate-900">
      
      {/* SIDEBAR MODERNO */}
      <aside className="w-full lg:w-[280px] bg-white border-r border-slate-100 flex flex-col lg:sticky lg:top-0 lg:h-screen z-50">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-white font-bold text-2xl">visibility</span>
            </div>
            <h1 className="text-xl font-black tracking-tight">Visión <span className="text-primary">Hub</span></h1>
          </div>
        </div>

        <nav className="flex-grow px-4 space-y-1">
          <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navegación</div>
          <SidebarLink 
            active={activeTab === 'quotes'} 
            onClick={() => { setActiveTab('quotes'); setStatusFilter('all'); }} 
            icon="receipt_long" 
            label="Cotizaciones" 
            badge={stats.pendingQuotes > 0 ? stats.pendingQuotes : undefined}
          />
          <SidebarLink 
            active={activeTab === 'appointments'} 
            onClick={() => { setActiveTab('appointments'); setStatusFilter('all'); }} 
            icon="calendar_month" 
            label="Citas Tienda" 
            badge={stats.todayAppointments > 0 ? stats.todayAppointments : undefined}
            badgeColor="bg-amber-500"
          />
          <SidebarLink 
            active={activeTab === 'messages'} 
            onClick={() => { setActiveTab('messages'); setStatusFilter('all'); }} 
            icon="chat_bubble" 
            label="Mensajería" 
            badge={stats.newMessages > 0 ? stats.newMessages : undefined}
            badgeColor="bg-rose-500"
          />
        </nav>

        <div className="p-4 border-t border-slate-50">
          <button onClick={() => logout()} className="w-full flex items-center gap-4 px-5 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors">
            <span className="material-symbols-outlined text-lg">logout</span> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-grow p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-10">
          
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                 <h2 className="text-3xl font-black tracking-tight text-slate-800">Panel de Gestión</h2>
                 <p className="text-slate-500 font-medium">Gestión integral de clientes y servicios.</p>
               </div>
               <div className="flex items-center gap-3">
                 <button onClick={loadData} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                   <span className="material-symbols-outlined text-xl">refresh</span>
                 </button>
                 <div className="relative">
                   <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                   <input
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     placeholder="Buscar en la lista..."
                     className="w-full md:w-[280px] h-12 pl-11 pr-4 rounded-xl border-slate-200 bg-white font-medium text-sm shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                   />
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               <StatCard icon="pending_actions" label="Cotizaciones Pendientes" value={stats.pendingQuotes} color="text-primary" bg="bg-blue-50" />
               <StatCard icon="event_upcoming" label="Citas para Hoy" value={stats.todayAppointments} color="text-amber-500" bg="bg-amber-50" />
               <StatCard icon="mark_chat_unread" label="Nuevos Mensajes" value={stats.newMessages} color="text-rose-500" bg="bg-rose-50" />
            </div>
          </div>

          <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm inline-flex items-center gap-1">
             <FilterBtn active={statusFilter === 'all'} label="Todos" onClick={() => setStatusFilter('all')} />
             {activeTab === 'quotes' && (
               <>
                 <FilterBtn active={statusFilter === 'Pendiente'} label="Pendientes" onClick={() => setStatusFilter('Pendiente')} />
                 <FilterBtn active={statusFilter === 'Contactado'} label="Contactados" onClick={() => setStatusFilter('Contactado')} />
                 <FilterBtn active={statusFilter === 'Finalizado'} label="Finalizados" onClick={() => setStatusFilter('Finalizado')} />
               </>
             )}
             {activeTab === 'appointments' && (
               <>
                 <FilterBtn active={statusFilter === 'pendiente'} label="Pendientes" onClick={() => setStatusFilter('pendiente')} />
                 <FilterBtn active={statusFilter === 'realizado'} label="Atendidos" onClick={() => setStatusFilter('realizado')} />
                 <FilterBtn active={statusFilter === 'no_asistio'} label="No Asistió" onClick={() => setStatusFilter('no_asistio')} />
               </>
             )}
             {activeTab === 'messages' && (
               <>
                 <FilterBtn active={statusFilter === 'new'} label="Sin Leer" onClick={() => setStatusFilter('new')} />
                 <FilterBtn active={statusFilter === 'read'} label="Leídos" onClick={() => setStatusFilter('read')} />
               </>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
            {filteredData.length > 0 ? (
              filteredData.map((item: any) => (
                <DataCard 
                  key={item.id} 
                  type={activeTab} 
                  data={item} 
                  onSelect={() => {
                    if (activeTab === 'quotes') setSelectedQuote(item);
                    else if (activeTab === 'appointments') setSelectedAppointment(item);
                    else setSelectedMessage(item);
                  }}
                />
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[40px] border border-slate-100 border-dashed">
                 <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-4xl">inventory_2</span>
                 </div>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay registros con estos filtros</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* DRAWERS */}
      
      {/* Detalle Mensaje */}
      <Drawer isOpen={!!selectedMessage} onClose={() => setSelectedMessage(null)} title="Mensaje de Cliente">
        {selectedMessage && (
          <div className="space-y-8">
            <div className={`flex items-center gap-4 p-6 rounded-3xl ${selectedMessage.status === 'new' ? 'bg-rose-50 border border-rose-100' : 'bg-slate-50 border border-slate-100'}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white ${selectedMessage.status === 'new' ? 'bg-rose-500' : 'bg-slate-400'}`}>
                {selectedMessage.nombre?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-black text-lg">{selectedMessage.nombre}</h3>
                <p className="text-sm text-slate-500 font-medium">{selectedMessage.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm italic text-slate-700 leading-relaxed">
                "{selectedMessage.mensaje}"
              </div>
              <p className="text-[10px] text-slate-400 font-bold px-4">Recibido el {new Date(selectedMessage.date).toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 pt-6">
              <a href={`mailto:${selectedMessage.email}`} onClick={() => handleMessageStatus(selectedMessage.id!, 'read')} className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-3 hover:bg-primary-hover transition-all">
                <span className="material-symbols-outlined">reply</span> RESPONDER POR EMAIL
              </a>
              <div className="flex gap-3">
                {selectedMessage.status === 'new' && (
                  <button onClick={() => handleMessageStatus(selectedMessage.id!, 'read')} className="flex-grow h-12 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">MARCAR LEÍDO</button>
                )}
                <button onClick={() => handleDeleteMessage(selectedMessage.id!)} className="h-12 w-full border border-rose-100 text-rose-500 font-bold flex items-center justify-center gap-2 rounded-xl hover:bg-rose-50 transition-colors">
                  <span className="material-symbols-outlined text-lg">delete</span> ELIMINAR MENSAJE
                </button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Detalle Cita */}
      <Drawer isOpen={!!selectedAppointment} onClose={() => setSelectedAppointment(null)} title="Gestión de Cita">
        {selectedAppointment && (
          <div className="space-y-8">
             <div className={`p-6 border rounded-3xl ${selectedAppointment.status === 'pendiente' ? 'bg-amber-50 border-amber-100' : selectedAppointment.status === 'realizado' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                <div className="flex justify-between items-start mb-4">
                  <span className={`font-black text-[10px] uppercase tracking-widest ${selectedAppointment.status === 'pendiente' ? 'text-amber-600' : selectedAppointment.status === 'realizado' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedAppointment.status}
                  </span>
                  <span className={`material-symbols-outlined ${selectedAppointment.status === 'pendiente' ? 'text-amber-500' : selectedAppointment.status === 'realizado' ? 'text-emerald-500' : 'text-rose-500'}`}>event</span>
                </div>
                <h3 className="text-xl font-black">{selectedAppointment.paciente}</h3>
                <p className="text-sm font-bold opacity-70 mt-1">{selectedAppointment.fecha} a las {selectedAppointment.hora} hrs</p>
             </div>
             
             <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
                  <span className="material-symbols-outlined text-primary">call</span> {selectedAppointment.telefono}
                </div>
                <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
                  <span className="material-symbols-outlined text-primary">eyeglasses</span> {selectedAppointment.tipoAtencion}
                </div>
             </div>

             <div className="pt-8 border-t space-y-3">
                {selectedAppointment.status !== 'realizado' && (
                  <button onClick={() => handleAppointmentStatus(selectedAppointment.id!, 'realizado')} className="w-full h-14 bg-emerald-600 text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:bg-emerald-700">
                    <span className="material-symbols-outlined">check_circle</span> MARCAR COMO ATENDIDO
                  </button>
                )}
                {selectedAppointment.status === 'pendiente' && (
                  <button onClick={() => handleAppointmentStatus(selectedAppointment.id!, 'no_asistio')} className="w-full h-14 bg-white border-2 border-rose-100 text-rose-500 font-black rounded-2xl hover:bg-rose-50 transition-all">EL PACIENTE NO ASISTIÓ</button>
                )}
                {selectedAppointment.status !== 'pendiente' && (
                  <button onClick={() => handleAppointmentStatus(selectedAppointment.id!, 'pendiente')} className="w-full h-14 border border-slate-200 text-slate-400 font-bold rounded-2xl hover:bg-slate-50">REVERTIR A PENDIENTE</button>
                )}
             </div>
          </div>
        )}
      </Drawer>

      {/* Detalle Cotización */}
      <Drawer isOpen={!!selectedQuote} onClose={() => setSelectedQuote(null)} title="Cotización Digital">
        {selectedQuote && (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-2">
              <span className="px-3 py-1 bg-primary/10 text-primary font-black text-[10px] rounded-lg tracking-widest">{selectedQuote.folio}</span>
              <StatusBadge status={selectedQuote.status || 'Pendiente'} />
            </div>
            
            {selectedQuote.imageUrl && (
              <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-xl group relative">
                <img src={selectedQuote.imageUrl} className="w-full h-auto" alt="Receta" />
                <a href={selectedQuote.imageUrl} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black gap-2">
                   <span className="material-symbols-outlined">open_in_new</span> VER ORIGINAL
                </a>
              </div>
            )}

            <div className="p-6 bg-slate-50 rounded-3xl">
              <h3 className="font-black text-lg mb-1">{selectedQuote.nombre}</h3>
              <p className="text-sm font-bold text-slate-500 mb-4">{selectedQuote.email} • {selectedQuote.telefono}</p>
              <div className="grid grid-cols-2 gap-3">
                 <div className="p-3 bg-white rounded-xl border border-slate-100">
                    <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Lente</span>
                    <span className="text-xs font-black">{selectedQuote.tipoLente}</span>
                 </div>
                 <div className="p-3 bg-white rounded-xl border border-slate-100">
                    <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Material</span>
                    <span className="text-xs font-black">{selectedQuote.material}</span>
                 </div>
              </div>
            </div>

            <div className="pt-6 border-t flex flex-col gap-3">
               <a href={`https://wa.me/${selectedQuote.telefono}`} target="_blank" className="w-full h-14 bg-[#25D366] text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-[#25D366]/20 transition-all">
                 <span className="material-symbols-outlined">chat</span> CONTACTAR POR WHATSAPP
               </a>
               <div className="grid grid-cols-2 gap-2">
                 {selectedQuote.status !== 'Finalizado' && (
                    <button onClick={() => handleQuoteStatus(selectedQuote.id!, 'Finalizado')} className="h-12 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700">MARCAR FINALIZADO</button>
                 )}
                 {selectedQuote.status === 'Pendiente' && (
                    <button onClick={() => handleQuoteStatus(selectedQuote.id!, 'Contactado')} className="h-12 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">MARCAR CONTACTADO</button>
                 )}
                 {selectedQuote.status !== 'Pendiente' && (
                    <button onClick={() => handleQuoteStatus(selectedQuote.id!, 'Pendiente')} className="h-12 border border-slate-200 text-slate-400 font-bold rounded-xl hover:bg-slate-50">VOLVER A PENDIENTE</button>
                 )}
               </div>
            </div>
          </div>
        )}
      </Drawer>

    </div>
  );
};

/* COMPONENTES ATÓMICOS */

const SidebarLink = ({ active, onClick, icon, label, badge, badgeColor = "bg-primary" }: any) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold text-sm transition-all group ${
      active ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
    }`}
  >
    <div className="flex items-center gap-4">
      <span className={`material-symbols-outlined transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`}>
        {icon}
      </span>
      {label}
    </div>
    {badge !== undefined && (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black text-white ${active ? 'bg-white/20' : badgeColor}`}>
        {badge}
      </span>
    )}
  </button>
);

const StatCard = ({ icon, label, value, color, bg }: any) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]">
    <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center`}>
      <span className="material-symbols-outlined text-2xl font-bold">{icon}</span>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  </div>
);

const FilterBtn = ({ active, label, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
      active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'
    }`}
  >
    {label}
  </button>
);

const DataCard = ({ type, data, onSelect }: any) => {
  const getInitials = (name: string) => (name || 'U').charAt(0).toUpperCase();
  const isUnreadMessage = type === 'messages' && data.status === 'new';
  
  return (
    <div 
      onClick={onSelect}
      className={`group bg-white p-6 rounded-[32px] border shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden ${
        isUnreadMessage ? 'border-rose-200 bg-rose-50/20' : 'border-slate-100'
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all group-hover:scale-110 ${
          type === 'messages' ? (data.status === 'new' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400') : 
          type === 'appointments' ? (data.status === 'realizado' ? 'bg-emerald-100 text-emerald-600' : data.status === 'no_asistio' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600') : 
          (data.status === 'Finalizado' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600')
        }`}>
          {getInitials(type === 'appointments' ? data.paciente : data.nombre)}
        </div>
        <StatusBadge status={data.status} />
      </div>

      <div className="space-y-1 mb-4">
        <h3 className="font-black text-slate-800 text-lg leading-tight group-hover:text-primary transition-colors">
          {type === 'appointments' ? data.paciente : (data.nombre || 'Sin nombre')}
        </h3>
        <p className="text-xs text-slate-400 font-bold">
          {type === 'messages' ? data.email : type === 'appointments' ? `${data.fecha} • ${data.hora} hrs` : data.folio}
        </p>
      </div>

      {type === 'messages' && (
        <p className="text-sm text-slate-500 font-medium line-clamp-2 italic leading-relaxed mb-4">"{data.mensaje}"</p>
      )}

      <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">
          {type === 'quotes' ? data.tipoLente : 'Gestión'}
        </span>
        <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-all text-lg group-hover:translate-x-1">arrow_forward_ios</span>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    'new': 'bg-rose-100 text-rose-600',
    'read': 'bg-slate-100 text-slate-400',
    'Pendiente': 'bg-amber-100 text-amber-600',
    'pendiente': 'bg-amber-100 text-amber-600',
    'Contactado': 'bg-blue-100 text-blue-600',
    'Finalizado': 'bg-emerald-100 text-emerald-600',
    'realizado': 'bg-emerald-100 text-emerald-600',
    'no_asistio': 'bg-rose-100 text-rose-600'
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status === 'new' ? 'Sin Leer' : status === 'read' ? 'Leído' : status}
    </span>
  );
};

const Drawer = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <aside className="fixed top-0 right-0 z-[110] h-full w-full sm:w-[500px] bg-white shadow-2xl p-10 overflow-y-auto animate-in slide-in-from-right duration-500 border-l border-slate-100">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
          <button onClick={onClose} className="w-12 h-12 hover:bg-slate-50 rounded-2xl flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>
        {children}
      </aside>
    </>
  );
};

export default AdminDashboard;

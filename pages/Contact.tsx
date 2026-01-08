
import React, { useState } from 'react';
import { saveContactMessage } from '../services/firebaseService';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      await saveContactMessage(formData);
      setSent(true);
      setFormData({ nombre: '', email: '', mensaje: '' });
    } catch (err) {
      setError("Ocurrió un error al enviar tu mensaje. Por favor intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="py-16 px-6 lg:px-40 bg-background-light animate-in fade-in duration-500">
      <div className="max-w-[1280px] mx-auto space-y-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-black text-text-main mb-4">Contáctanos</h1>
          <p className="text-text-sub text-lg leading-relaxed">
            Estamos aquí para ayudarte. Visítanos en nuestra sucursal o escríbenos a través del formulario para cualquier duda técnica o comercial.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info Cards */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                 <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined">location_on</span>
                 </div>
                 <div>
                    <h3 className="font-bold text-text-main">Dirección</h3>
                    <p className="text-sm text-text-sub mt-1">Av. Principal 123<br/>Santiago, Chile</p>
                 </div>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                 <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined">call</span>
                 </div>
                 <div>
                    <h3 className="font-bold text-text-main">Teléfono</h3>
                    <p className="text-sm text-text-sub mt-1">+56 9 1234 5678</p>
                    <button className="text-primary text-xs font-bold hover:underline mt-1">Llamar ahora</button>
                 </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex gap-4">
               <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined">schedule</span>
               </div>
               <div>
                  <h3 className="font-bold text-text-main">Horarios de Atención</h3>
                  <div className="mt-2 space-y-1 text-sm text-text-sub">
                    <p>Lunes a Viernes: 09:00 - 19:00 hrs</p>
                    <p>Sábados: 10:00 - 14:00 hrs</p>
                    <p className="text-red-500 font-medium">Domingos: Cerrado</p>
                  </div>
               </div>
            </div>

            <div className="h-[300px] rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative grayscale hover:grayscale-0 transition-all duration-700 cursor-pointer">
              <img src="https://picsum.photos/seed/location/800/600" alt="Map View" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/5 hover:bg-transparent transition-colors"></div>
              <button className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-white text-text-main font-bold rounded-full shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-primary">map</span>
                Abrir en Google Maps
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            {sent ? (
              <div className="text-center py-12 space-y-6 animate-zoom-in">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-5xl">check_circle</span>
                </div>
                <h2 className="text-2xl font-black text-text-main">¡Mensaje Enviado!</h2>
                <p className="text-text-sub font-medium">Gracias por contactarnos. Te responderemos a la brevedad posible.</p>
                <button 
                  onClick={() => setSent(false)}
                  className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-hover transition-all"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6">Envíanos un mensaje</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                    <input 
                      type="text" 
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white transition-colors" 
                      placeholder="Ej: Juan Pérez" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Correo Electrónico</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white transition-colors" 
                      placeholder="tu@correo.com" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mensaje</label>
                    <textarea 
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      required
                      rows={4} 
                      className="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white transition-colors" 
                      placeholder="Escribe tu consulta aquí..."
                    ></textarea>
                  </div>
                  {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
                  <button 
                    disabled={sending}
                    className="w-full py-4 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary-hover transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ENVIANDO...
                      </>
                    ) : 'Enviar mensaje'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

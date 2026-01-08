
import React from 'react';
import { Page } from '../types';
import { TEAM_MEMBERS } from '../constants';

interface AboutProps {
  onNavigate: (page: Page) => void;
}

const About: React.FC<AboutProps> = ({ onNavigate }) => {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero */}
      <section className="px-6 lg:px-40 py-20 bg-white">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 w-full h-[400px] rounded-[40px] overflow-hidden shadow-2xl border-8 border-gray-50">
             <img 
               src="https://images.unsplash.com/photo-1577415124269-fc1140a69e91?auto=format&fit=crop&q=80&w=1000" 
               alt="Nuestra Óptica" 
               className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
             />
          </div>
          <div className="md:w-1/2 space-y-6">
            <span className="text-primary font-bold uppercase tracking-widest text-[10px] bg-primary/10 px-3 py-1 rounded-full">Nuestra Esencia</span>
            <h1 className="text-4xl lg:text-5xl font-black text-text-main leading-tight tracking-tighter">Más de una década asesorando miradas</h1>
            <p className="text-text-sub text-lg leading-relaxed font-medium">
              Fundada en 2012, Óptica Visión nació con el propósito de ofrecer una experiencia de compra única. Combinamos tecnología en cristales con la calidez de un equipo que se preocupa por tu imagen y bienestar.
            </p>
            <button 
              onClick={() => onNavigate(Page.BOOKING)}
              className="px-8 h-14 bg-primary text-white font-black rounded-2xl hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all active:scale-95"
            >
              Agenda tu visita
            </button>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 lg:px-40 bg-gray-50">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'verified_user', title: 'Excelencia', desc: 'Equipo experto en constante capacitación técnica para darte la mejor asesoría en cristales.' },
              { icon: 'biotech', title: 'Precisión', desc: 'Tecnología avanzada para el montaje preciso de tus lentes y acabados de alta definición.' },
              { icon: 'favorite', title: 'Atención', desc: 'No solo vendemos lentes, asesoramos tu estética y resaltamos tu estilo personal con cada marco.' },
            ].map((v, i) => (
              <div key={i} className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm text-center hover:shadow-xl transition-all">
                 <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-8 rotate-3 group-hover:rotate-0 transition-transform">
                    <span className="material-symbols-outlined text-4xl">{v.icon}</span>
                 </div>
                 <h3 className="font-black text-text-main mb-4 text-xl">{v.title}</h3>
                 <p className="text-sm text-text-sub leading-relaxed font-medium">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6 lg:px-40 bg-white">
        <div className="max-w-[1100px] mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto">
             <h2 className="text-4xl font-black mb-4 tracking-tight">Nuestro Equipo</h2>
             <p className="text-text-sub font-medium text-lg">Conoce a los asesores expertos que te ayudarán a elegir tus próximos lentes.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
            {TEAM_MEMBERS.map((member, i) => (
              <div key={i} className="group text-center">
                 <div className="aspect-[3/4] rounded-[40px] overflow-hidden mb-6 shadow-lg border border-gray-100 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                 </div>
                 <h4 className="font-black text-2xl text-text-main group-hover:text-primary transition-colors">{member.name}</h4>
                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 mt-1">{member.role}</p>
                 <p className="text-sm text-text-sub leading-relaxed font-medium px-4">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-24 px-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="max-w-[700px] mx-auto text-center space-y-8 relative z-10">
          <div className="w-20 h-20 bg-white text-primary rounded-3xl flex items-center justify-center mx-auto shadow-2xl rotate-12">
             <span className="material-symbols-outlined text-4xl">location_on</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">¿Listo para renovar tu mirada?</h2>
          <p className="text-blue-50 text-lg leading-relaxed font-medium">
            Visítanos en nuestra tienda para recibir asesoría personalizada y probarte los marcos que mejor te quedan.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
             <button onClick={() => onNavigate(Page.BOOKING)} className="px-10 h-16 bg-white text-primary font-black rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95">Agenda tu Prueba</button>
             <button onClick={() => onNavigate(Page.CONTACT)} className="px-10 h-16 bg-primary-hover border-2 border-white/20 text-white font-black rounded-2xl hover:bg-primary transition-all active:scale-95">Contáctanos</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

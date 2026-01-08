
import React from 'react';
import { Page } from '../types';
import { SERVICES } from '../constants';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col animate-fade-in">
      {/* Hero Section */}
      <section className="px-6 lg:px-40 py-16 md:py-24 bg-white overflow-hidden">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slide-up">
            <h1 className="text-4xl md:text-6xl font-black text-text-main leading-tight tracking-tight">
              Encuentra tu estilo <br />
              <span className="text-primary">con expertos</span>
            </h1>
            <p className="text-lg text-text-sub max-w-lg leading-relaxed">
              Descubre nuestra exclusiva colección de marcos y recibe asesoría personalizada para elegir los cristales perfectos según tu receta.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => onNavigate(Page.QUOTE)}
                className="h-12 px-8 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary-hover transition-all active:scale-95"
              >
                Cotiza tu receta
              </button>
              <button 
                onClick={() => onNavigate(Page.BOOKING)}
                className="h-12 px-8 border border-gray-200 text-text-main font-bold rounded-lg hover:bg-gray-50 transition-all active:scale-95"
              >
                Reserva una prueba
              </button>
            </div>
          </div>
          <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="rounded-2xl overflow-hidden shadow-2xl transition-transform duration-700 hover:scale-[1.02]">
              <img 
                src="https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&q=80&w=1000" 
                alt="Tienda Óptica"
                className="w-full h-full object-cover min-h-[400px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-background-light py-24 px-6 lg:px-40">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <span className="text-primary font-bold uppercase tracking-[0.2em] text-[10px]">Nuestros Servicios</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-black text-text-main tracking-tight">Asesoría Óptica Especializada</h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 lg:gap-10">
            {SERVICES.map((service, idx) => (
              <div 
                key={service.id}
                className="group w-full sm:w-64 md:w-72 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center animate-fade-in flex flex-col items-center"
                style={{ animationDelay: `${0.1 * idx}s` }}
              >
                <div className="mb-6 w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-3xl">{service.icon}</span>
                </div>
                <h3 className="font-black text-text-main mb-3 text-lg">{service.title}</h3>
                <p className="text-xs text-text-sub leading-relaxed font-medium">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary py-20 px-6 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -ml-32 -mt-32 blur-3xl"></div>
           <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mb-32 blur-3xl"></div>
        </div>
        <div className="animate-zoom-in relative z-10">
          <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">Ven a probarte tus próximos lentes</h2>
          <p className="text-blue-100 mb-10 max-w-2xl mx-auto font-medium text-lg">Agenda una visita para recibir asesoría estética y técnica sin costo adicional.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => onNavigate(Page.BOOKING)}
              className="px-10 h-16 bg-white text-primary font-black rounded-2xl shadow-2xl hover:bg-gray-50 transition-all active:scale-95"
            >
              Agenda tu Prueba de Marcos
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

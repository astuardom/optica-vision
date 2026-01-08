
import React, { useState } from 'react';
import { Page } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Inicio', page: Page.HOME },
    { label: 'Cotizar Receta', page: Page.QUOTE },
    { label: 'Reservar Prueba', page: Page.BOOKING },
    { label: 'Nosotros', page: Page.ABOUT },
    { label: 'Contacto', page: Page.CONTACT },
  ];

  const handleMobileNav = (page: Page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 lg:px-40 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-[1280px] mx-auto">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => onNavigate(Page.HOME)}
          >
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors">visibility</span>
            </div>
            <h2 className="text-xl font-black text-text-main tracking-tight">Óptica <span className="text-primary">Visión</span></h2>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {menuItems.map((item) => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`text-sm font-bold transition-all hover:text-primary relative py-2 ${
                  currentPage === item.page ? 'text-primary' : 'text-text-sub'
                }`}
              >
                {item.label}
                {currentPage === item.page && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-fade-in"></span>
                )}
              </button>
            ))}
          </nav>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-text-main hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl animate-slide-up">
            <nav className="flex flex-col p-6 gap-4">
              {menuItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => handleMobileNav(item.page)}
                  className={`flex items-center justify-between p-4 rounded-xl font-bold text-left transition-colors ${
                    currentPage === item.page ? 'bg-primary/5 text-primary' : 'text-text-main hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 py-16 px-6 lg:px-40">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary font-bold">visibility</span>
              <h3 className="font-black text-lg">Óptica Visión</h3>
            </div>
            <p className="text-sm text-text-sub leading-relaxed">
              Encuentra los mejores marcos y cristales con asesoría experta.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-main">Empresa</h4>
            <nav className="flex flex-col gap-3">
              <button onClick={() => onNavigate(Page.ABOUT)} className="text-sm text-text-sub hover:text-primary text-left transition-colors">Nosotros</button>
              <button onClick={() => onNavigate(Page.CONTACT)} className="text-sm text-text-sub hover:text-primary text-left transition-colors">Sucursales</button>
              <button onClick={() => onNavigate(Page.BOOKING)} className="text-sm text-text-sub hover:text-primary text-left transition-colors">Reserva tu Prueba</button>
              <button onClick={() => onNavigate(Page.ADMIN)} className="text-sm text-text-sub hover:text-primary text-left transition-colors flex items-center gap-2 italic">
                <span className="material-symbols-outlined text-xs">lock</span> Panel de Gestión
              </button>
            </nav>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-main">Contacto</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-text-sub">
                <span className="material-symbols-outlined text-primary text-lg">call</span>
                <span>+56 2 2345 6789</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-sub">
                <span className="material-symbols-outlined text-primary text-lg">mail</span>
                <span>contacto@opticavision.cl</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-main">Sucursal</h4>
            <div className="h-40 rounded-2xl overflow-hidden relative border border-gray-100">
              <img src="https://picsum.photos/seed/map/400/300" alt="Mapa" className="w-full h-full object-cover opacity-60 grayscale" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined">location_on</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-50 mt-16 pt-8 text-center">
          <p className="text-[10px] text-gray-400 font-medium tracking-wide">© 2024 ÓPTICA VISIÓN CHILE. TODOS LOS DERECHOS RESERVADOS.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

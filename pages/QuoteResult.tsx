
import React, { useEffect, useState } from 'react';
import { Page, Prescription } from '../types';
import { getSmartRecommendation } from '../services/geminiService';

interface QuoteResultProps {
  prescription: Prescription | null;
  onNavigate: (page: Page) => void;
}

const QuoteResult: React.FC<QuoteResultProps> = ({ prescription, onNavigate }) => {
  const [recommendation, setRecommendation] = useState<string>('');

  useEffect(() => {
    if (prescription) {
      getSmartRecommendation(prescription).then(setRecommendation);
    }
  }, [prescription]);

  if (!prescription) {
    return (
      <div className="py-20 text-center animate-fade-in bg-background-light min-h-screen">
        <p className="text-text-sub mb-4">No se encontró información de cotización.</p>
        <button onClick={() => onNavigate(Page.QUOTE)} className="text-primary font-bold underline">Volver</button>
      </div>
    );
  }

  return (
    <div className="py-12 px-6 lg:px-40 flex flex-col items-center animate-zoom-in bg-background-light min-h-screen">
      <div className="w-full max-w-[700px]">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-text-main mb-2">¡Cotización Enviada!</h1>
          <span className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-lg text-xs uppercase tracking-tight">
            Folio: {prescription.folio}
          </span>
        </div>

        <div className="bg-white border border-gray-100 rounded-[40px] shadow-xl overflow-hidden mb-8 p-8 md:p-12 space-y-10">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <span className="text-[8px] font-black text-text-sub uppercase block">TIPO</span>
                <p className="font-bold text-sm">{prescription.tipoLente}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <span className="text-[8px] font-black text-text-sub uppercase block">MATERIAL</span>
                <p className="font-bold text-sm">{prescription.material}</p>
              </div>
              <div className="p-4 bg-blue-50 text-primary rounded-2xl">
                <span className="text-[8px] font-black uppercase block">D.P.</span>
                <p className="font-bold text-sm">{prescription.distancia_pupilar || 'S/D'}</p>
              </div>
            </div>

            <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-4 text-center bg-gray-50 py-3 text-[10px] font-black text-text-sub">
                  <div>LADO</div><div>ESFERA</div><div>CILINDRO</div><div>EJE</div>
                </div>
                <div className="grid grid-cols-4 text-center py-4 text-sm font-bold border-t border-gray-100">
                  <div className="text-primary">OD</div><div>{prescription.od_esfera || '0.00'}</div><div>{prescription.od_cilindro || '0.00'}</div><div>{prescription.od_eje || '0'}°</div>
                </div>
                <div className="grid grid-cols-4 text-center py-4 text-sm font-bold border-t border-gray-100">
                  <div className="text-primary">OI</div><div>{prescription.oi_esfera || '0.00'}</div><div>{prescription.oi_cilindro || '0.00'}</div><div>{prescription.oi_eje || '0'}°</div>
                </div>
            </div>

            <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 italic text-sm text-text-main">
               "{recommendation || "Generando recomendación..."}"
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <a href={prescription.whatsappUrl} target="_blank" className="h-16 bg-[#25D366] text-white font-black rounded-2xl flex items-center justify-center gap-3">
            <span className="material-symbols-outlined">chat</span> WhatsApp Asesor
          </a>
          <button onClick={() => onNavigate(Page.BOOKING)} className="h-16 bg-primary text-white font-black rounded-2xl">
             Agendar Examen
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuoteResult;

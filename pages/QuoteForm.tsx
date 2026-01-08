
import React, { useState } from 'react';
import { Prescription } from '../types';
import { analyzePrescription } from '../services/geminiService';
import { uploadToCloudinary, saveQuote } from '../services/firebaseService';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxdlA9KA0XHYD5xY9ntGGdESSgQC1NK169Ao1an7lfbzCFTjv94nbpVhYgY7u9q2Ljs8A/exec'; 

const QuoteForm: React.FC<{ onSubmit: (data: Prescription) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<Prescription>({
    od_esfera: '', od_cilindro: '', od_eje: '',
    oi_esfera: '', oi_cilindro: '', oi_eje: '',
    adicion: '', distancia_pupilar: '',
    tipoLente: 'Monofocal', material: 'Orgánico Standard',
    nombre: '', telefono: '', email: ''
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);

      if (file.type.startsWith('image/')) {
        setAnalyzing(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64 = (reader.result as string).split(',')[1];
            const result = await analyzePrescription(base64);
            if (result) {
              // Actualizamos el formData con todo lo detectado (incluyendo nombre)
              setFormData(prev => ({ 
                ...prev, 
                ...result,
                // Si el resultado no trae nombre, mantenemos el que estaba
                nombre: result.nombre || prev.nombre 
              }));
            } else {
              setError("No pudimos extraer datos automáticamente, pero puedes ingresarlos tú mismo.");
            }
          } catch (err) {
            console.error("Error en análisis IA:", err);
          } finally {
            setAnalyzing(false);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      let imageUrl = '';
      if (selectedFile) {
        imageUrl = await uploadToCloudinary(selectedFile);
      }

      const folio = "COT-" + Math.floor(1000 + Math.random() * 9000);
      const fullData = { ...formData, folio, imageUrl };

      await saveQuote(fullData);

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ action: 'cotizar', ...fullData })
      }).catch(err => console.error("Apps Script Error:", err));

      const waUrl = `https://wa.me/56912345678?text=Hola! Mi folio de cotización es ${folio}. Mi nombre es ${formData.nombre}`;
      onSubmit({ ...fullData, whatsappUrl: waUrl });
    } catch (error: any) {
      setError("Error al procesar la solicitud. Revisa tu conexión.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-6 lg:px-40 bg-background-light animate-slide-up min-h-screen">
      <div className="max-w-[850px] mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-text-main mb-2 tracking-tight">Cotizador <span className="text-primary">Cloud</span></h1>
          <p className="text-text-sub font-medium">Sube tu receta e identificaremos los valores automáticamente.</p>
        </div>

        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12 bg-blue-50/20 border-b border-gray-100">
            <div className={`relative h-48 flex flex-col items-center justify-center border-2 border-dashed rounded-[32px] transition-all cursor-pointer group ${analyzing ? 'bg-white border-primary cursor-wait' : 'bg-white border-primary/30 hover:border-primary'}`}>
              {analyzing ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-primary font-black uppercase text-[10px] tracking-widest">Analizando Receta con IA...</span>
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-5xl text-primary/40 group-hover:text-primary transition-colors mb-2">upload_file</span>
                  <span className="text-sm font-black text-text-main">{selectedFile ? selectedFile.name : 'Sube tu foto de receta'}</span>
                  <span className="text-[10px] text-text-sub font-bold mt-1 uppercase">Extracción automática de valores</span>
                </>
              )}
              <input type="file" accept="image/*,application/pdf" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={analyzing} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {['od', 'oi'].map((side) => (
                <div key={side} className="p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                  <span className="text-[10px] font-black text-primary uppercase block mb-4 tracking-widest">Ojo {side === 'od' ? 'Derecho' : 'Izquierdo'}</span>
                  <div className="grid grid-cols-3 gap-3">
                    {['esfera', 'cilindro', 'eje'].map((field) => (
                      <div key={field} className="space-y-1">
                        <label className="text-[8px] font-black text-text-sub uppercase text-center block">{field.slice(0,3)}</label>
                        <input type="text" name={`${side}_${field}`} value={(formData as any)[`${side}_${field}`]} onChange={handleChange} placeholder="0.00" className="w-full rounded-xl border-gray-100 text-center font-bold text-sm h-12" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-50">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-sub uppercase tracking-widest px-2">D.P. (Distancia Pupilar)</label>
                  <input type="text" name="distancia_pupilar" value={formData.distancia_pupilar} onChange={handleChange} placeholder="Ej: 62mm" className="w-full h-12 rounded-xl border-gray-100 px-4 font-bold text-sm focus:ring-primary" />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-sub uppercase tracking-widest px-2">Tipo Lente</label>
                  <select name="tipoLente" value={formData.tipoLente} onChange={handleChange} className="w-full h-12 rounded-xl border-gray-100 px-4 font-bold text-sm focus:ring-primary">
                    <option>Monofocal</option>
                    <option>Bifocal</option>
                    <option>Multifocal</option>
                  </select>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-sub uppercase tracking-widest px-2">Material</label>
                  <select name="material" value={formData.material} onChange={handleChange} className="w-full h-12 rounded-xl border-gray-100 px-4 font-bold text-sm focus:ring-primary">
                    <option>Orgánico Standard</option>
                    <option>Policarbonato</option>
                    <option>Alto Índice</option>
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
               <div className="space-y-4">
                  <input type="text" name="nombre" placeholder="Nombre completo" value={formData.nombre} onChange={handleChange} required className="w-full h-14 rounded-2xl border-gray-100 px-6 font-bold text-sm focus:ring-primary" />
                  <input type="tel" name="telefono" placeholder="WhatsApp" value={formData.telefono} onChange={handleChange} required className="w-full h-14 rounded-2xl border-gray-100 px-6 font-bold text-sm focus:ring-primary" />
               </div>
               <div className="space-y-4">
                  <input type="email" name="email" placeholder="Correo" value={formData.email} onChange={handleChange} required className="w-full h-14 rounded-2xl border-gray-100 px-6 font-bold text-sm focus:ring-primary" />
                  <button type="submit" disabled={submitting || analyzing} className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                    {submitting ? 'ENVIANDO...' : 'SOLICITAR COTIZACIÓN'}
                  </button>
               </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuoteForm;

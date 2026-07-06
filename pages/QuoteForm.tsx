import React, { useState, useRef } from 'react';
import { Prescription } from '../types';
import { saveQuote, uploadQuoteImage } from '../services/supabaseService';


const QuoteForm: React.FC<{ onSubmit: (data: Prescription) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<Prescription>({
    od_esfera: '', od_cilindro: '', od_eje: '',
    oi_esfera: '', oi_cilindro: '', oi_eje: '',
    adicion: '', distancia_pupilar: '',
    tipoLente: 'Monofocal', material: 'Orgánico Standard',
    nombre: '', telefono: '', email: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      if (error) setError(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const folio = "COT-" + Math.floor(1000 + Math.random() * 9000);
      let imageUrl = '';

      if (selectedFile) {
        imageUrl = await uploadQuoteImage(selectedFile);
      }

      const fullData = { ...formData, folio, imageUrl };

      await saveQuote(fullData);

      const waUrl = `https://wa.me/56912345678?text=Hola! Mi folio de cotización es ${folio}. Mi nombre es ${formData.nombre}`;
      onSubmit({ ...fullData, whatsappUrl: waUrl });
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Error al procesar la solicitud. Revisa tu conexión.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-6 lg:px-40 bg-background-light animate-slide-up min-h-screen">
      <div className="max-w-[850px] mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-text-main mb-2 tracking-tight">Cotizador de <span className="text-primary">Lentes</span></h1>
          <p className="text-text-sub font-medium">Ingresa los datos de tu receta y te contactamos con la mejor opción para ti.</p>
        </div>

        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {['od', 'oi'].map((side) => (
                <div key={side} className="p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                  <span className="text-[10px] font-black text-primary uppercase block mb-4 tracking-widest">Ojo {side === 'od' ? 'Derecho' : 'Izquierdo'}</span>
                  <div className="grid grid-cols-3 gap-3">
                    {['esfera', 'cilindro', 'eje'].map((field) => (
                      <div key={field} className="space-y-1">
                        <label className="text-[8px] font-black text-text-sub uppercase text-center block">{field.slice(0, 3)}</label>
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

            {/* SECCIÓN SUBIR RECETA */}
            <div className="pt-6 border-t border-gray-50 space-y-4">
              <label className="text-[10px] font-black text-text-sub uppercase tracking-widest px-2">Sube tu Receta Médica (Opcional)</label>
              
              {!filePreview ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors rounded-[24px] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer group bg-gray-50/50"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-text-sub group-hover:text-primary group-hover:scale-110 transition-all shadow-sm">
                    <span className="material-symbols-outlined text-2xl">upload_file</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-text-main">Haz clic para subir una imagen</p>
                    <p className="text-xs text-text-sub mt-1">Soporta PNG, JPG, JPEG</p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              ) : (
                <div className="relative rounded-[24px] border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-between p-4 shadow-sm animate-zoom-in">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-white">
                      <img src={filePreview} alt="Vista previa de receta" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-main line-clamp-1">{selectedFile?.name}</p>
                      <p className="text-xs text-text-sub mt-0.5">{(selectedFile!.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={handleRemoveFile}
                    className="w-10 h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-50">
              <div className="space-y-4">
                <input type="text" name="nombre" placeholder="Nombre completo" value={formData.nombre} onChange={handleChange} required className="w-full h-14 rounded-2xl border-gray-100 px-6 font-bold text-sm focus:ring-primary" />
                <input type="tel" name="telefono" placeholder="WhatsApp" value={formData.telefono} onChange={handleChange} required className="w-full h-14 rounded-2xl border-gray-100 px-6 font-bold text-sm focus:ring-primary" />
              </div>
              <div className="space-y-4">
                <input type="email" name="email" placeholder="Correo" value={formData.email} onChange={handleChange} required className="w-full h-14 rounded-2xl border-gray-100 px-6 font-bold text-sm focus:ring-primary" />
                <button type="submit" disabled={submitting} className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-3 disabled:opacity-50">
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

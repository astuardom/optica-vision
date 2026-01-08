// services/geminiService.ts (FRONTEND)
// ✅ Frontend seguro: NO usa @google/genai, NO lee API keys.
// ✅ Llama a funciones serverless en /api/* (Vercel) que usan GEMINI_API_KEY en servidor.

export type PrescriptionJson = {
  nombre: string;
  od_esfera: string;
  od_cilindro: string;
  od_eje: string;
  oi_esfera: string;
  oi_cilindro: string;
  oi_eje: string;
  adicion: string;
  distancia_pupilar: string;
  notes: string;
};

/**
 * Analiza una imagen de receta óptica (base64) usando el backend (/api/gemini-prescription).
 * imageBase64 puede venir con o sin "data:image/...;base64,".
 */
export async function analyzePrescription(imageBase64: string): Promise<PrescriptionJson | null> {
  if (!imageBase64) return null;

  const res = await fetch('/api/gemini-prescription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(err || `Gemini API failed (${res.status})`);
  }

  return res.json();
}

/**
 * Obtiene recomendación (2 frases) desde el backend (/api/gemini-recommendation).
 */
export async function getSmartRecommendation(prescriptionData: any): Promise<string> {
  const res = await fetch('/api/gemini-recommendation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prescriptionData }),
  });

  if (!res.ok) {
    // fallback amigable
    return 'Nuestros expertos recomiendan cristales con filtro azul y tratamiento antirreflejo.';
  }

  const data = await res.json().catch(() => null);
  return (data?.text as string) || 'Nuestros expertos recomiendan cristales con filtro azul y tratamiento antirreflejo.';
}

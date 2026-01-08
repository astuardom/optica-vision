
import { GoogleGenAI, Type } from "@google/genai";

let apiKey = (process.env.API_KEY || process.env.GEMINI_API_KEY || '').trim();

// Fix: Strip "GEMINI_API_KEY=" prefix if the loader included it by mistake
if (apiKey.includes('GEMINI_API_KEY=')) {
  apiKey = apiKey.split('GEMINI_API_KEY=')[1].trim();
}

// A valid Gemini API key should start with 'AIzaSy' and be around 39 characters long.
const isKeyValid = apiKey.length > 20 &&
  apiKey.startsWith('AIzaSy') &&
  !apiKey.toUpperCase().includes('PLACEHOLDER') &&
  !apiKey.includes('TU_API_KEY') &&
  !apiKey.includes('MISSING_API_KEY');

if (!isKeyValid) {
  console.error("CRITICAL: Gemini API Key is missing, invalid, or a placeholder. AI features will be disabled.");
  if (apiKey) {
    console.log(`Detected key: "${apiKey.substring(0, 10)}..." (Length: ${apiKey.length})`);
  }
} else {
  console.log(`Gemini API Key validated. Starts with: ${apiKey.substring(0, 6)}...`);
}



const ai = new GoogleGenAI({ apiKey: isKeyValid ? apiKey : 'dummy_key' });




/**
 * Analiza una imagen de receta y extrae los valores técnicos incluyendo el nombre del paciente y la D.P.
 */
export async function analyzePrescription(imageBase64: string) {
  if (!isKeyValid) {
    console.warn("Skipping analyzePrescription: No valid API key.");
    return null;
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
          { text: "Analiza esta receta óptica. Extrae el nombre del paciente (patient name), Esfera (Sphere), Cilindro (Cylinder) y Eje (Axis) para OD y OI. Extrae la Adición (ADD) y la Distancia Pupilar (D.P. o PD). Responde estrictamente en formato JSON." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nombre: { type: Type.STRING, description: "Nombre completo del paciente si aparece en la receta" },
            od_esfera: { type: Type.STRING },
            od_cilindro: { type: Type.STRING },
            od_eje: { type: Type.STRING },
            oi_esfera: { type: Type.STRING },
            oi_cilindro: { type: Type.STRING },
            oi_eje: { type: Type.STRING },
            adicion: { type: Type.STRING },
            distancia_pupilar: { type: Type.STRING },
            notes: { type: Type.STRING }
          }
        }
      }
    });

    if (!response.text) return null;
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return null;
  }
}

/**
 * Provee una recomendación basada en los valores de la receta.
 */
export async function getSmartRecommendation(prescriptionData: any) {
  if (!isKeyValid) return "Nuestros expertos recomiendan cristales con filtro azul y tratamiento antirreflejo.";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Receta: ${JSON.stringify(prescriptionData)}. Recomienda en 2 frases cortas y amigables el mejor material (Policarbonato, Orgánico o Alto Índice) y tratamiento (Filtro Azul, Antirreflejo) para este paciente.`,
    });
    return response.text;

  } catch (error) {
    return "Nuestros expertos recomiendan cristales con filtro azul y tratamiento antirreflejo para mayor nitidez y descanso visual.";
  }
}

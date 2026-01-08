
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analiza una imagen de receta y extrae los valores técnicos incluyendo el nombre del paciente y la D.P.
 */
export async function analyzePrescription(imageBase64: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
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
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Receta: ${JSON.stringify(prescriptionData)}. Recomienda en 2 frases cortas y amigables el mejor material (Policarbonato, Orgánico o Alto Índice) y tratamiento (Filtro Azul, Antirreflejo) para este paciente.`,
    });
    return response.text;
  } catch (error) {
    return "Nuestros expertos recomiendan cristales con filtro azul y tratamiento antirreflejo para mayor nitidez y descanso visual.";
  }
}

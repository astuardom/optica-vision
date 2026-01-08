// geminiService.ts
// ✅ Compatible con @google/genai (Google Gen AI SDK)
// ✅ Modelo actualizado (evita 404 por modelos retirados)
// ✅ Soporta Vite (import.meta.env) y Node (process.env)
// ✅ Multimodal (imagen + texto) y salida JSON con schema
//
// Requisitos:
//   npm i @google/genai
//
// En Vite: crea .env con:
//   VITE_GEMINI_API_KEY=AIzaSyxxxxx
//
// En Node: export GEMINI_API_KEY=AIzaSyxxxxx

import { GoogleGenAI, Type } from "@google/genai";

/** Modelo recomendado actualmente en la documentación oficial: gemini-2.5-flash */
// Si por alguna razón tu proyecto no lo tiene habilitado, prueba con otra variante visible en ListModels.
const DEFAULT_MODEL = "gemini-2.5-flash";

/** Leer API key en Vite (frontend) o Node (backend) */
function readApiKey(): string {
  // Vite / Browser
  const viteKey =
    typeof import.meta !== "undefined" &&
    (import.meta as any).env &&
    ((import.meta as any).env.VITE_GEMINI_API_KEY ||
      (import.meta as any).env.VITE_API_KEY ||
      (import.meta as any).env.GEMINI_API_KEY ||
      (import.meta as any).env.API_KEY);

  // Node
  const nodeKey =
    typeof process !== "undefined" &&
    (process as any).env &&
    ((process as any).env.GEMINI_API_KEY ||
      (process as any).env.API_KEY ||
      (process as any).env.VITE_GEMINI_API_KEY);

  let apiKey = String(viteKey || nodeKey || "").trim();

  // Fix por si llega con "GEMINI_API_KEY=..."
  if (apiKey.includes("GEMINI_API_KEY=")) {
    apiKey = apiKey.split("GEMINI_API_KEY=")[1].trim();
  }

  return apiKey;
}

function isValidKey(apiKey: string): boolean {
  return (
    apiKey.length > 20 &&
    apiKey.startsWith("AIzaSy") &&
    !apiKey.toUpperCase().includes("PLACEHOLDER") &&
    !apiKey.includes("TU_API_KEY") &&
    !apiKey.includes("MISSING_API_KEY")
  );
}

/** Quita el prefijo data URL si viene en el base64 */
function stripDataUrlPrefix(inputBase64: string): string {
  if (!inputBase64) return "";
  // data:image/jpeg;base64,xxxx
  const idx = inputBase64.indexOf("base64,");
  return idx >= 0 ? inputBase64.substring(idx + "base64,".length).trim() : inputBase64.trim();
}

/** Extrae texto del response de forma robusta */
function getResponseText(resp: any): string {
  // En los ejemplos oficiales: response.text
  if (resp?.text && typeof resp.text === "string") return resp.text;

  // Fallback por si el SDK cambia estructura
  const t =
    resp?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join("") || "";
  return t;
}

const apiKey = readApiKey();
const hasKey = isValidKey(apiKey);

if (!hasKey) {
  console.error(
    "CRITICAL: Gemini API Key missing/invalid. Set VITE_GEMINI_API_KEY (Vite) o GEMINI_API_KEY (Node)."
  );
  if (apiKey) console.log(`Detected key: "${apiKey.substring(0, 10)}..." (Length: ${apiKey.length})`);
} else {
  console.log(`Gemini API Key validated. Starts with: ${apiKey.substring(0, 6)}...`);
}

const ai = new GoogleGenAI({ apiKey: hasKey ? apiKey : "dummy_key" });

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
 * Analiza una imagen de receta y extrae valores en JSON (schema).
 * imageBase64 puede venir con o sin "data:image/...;base64,"
 */
export async function analyzePrescription(imageBase64: string): Promise<PrescriptionJson | null> {
  if (!hasKey) {
    console.warn("Skipping analyzePrescription: No valid API key.");
    return null;
  }

  const cleanBase64 = stripDataUrlPrefix(imageBase64);
  if (!cleanBase64) return null;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { data: cleanBase64, mimeType: "image/jpeg" } },
            {
              text:
                "Analiza esta receta óptica. Extrae el nombre del paciente (patient name) si aparece, " +
                "Esfera (Sphere), Cilindro (Cylinder) y Eje (Axis) para OD y OI. " +
                "Extrae la Adición (ADD) y la Distancia Pupilar (D.P. o PD). " +
                "Responde estrictamente en JSON siguiendo el schema.",
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nombre: { type: Type.STRING, description: "Nombre completo del paciente si aparece" },
            od_esfera: { type: Type.STRING },
            od_cilindro: { type: Type.STRING },
            od_eje: { type: Type.STRING },
            oi_esfera: { type: Type.STRING },
            oi_cilindro: { type: Type.STRING },
            oi_eje: { type: Type.STRING },
            adicion: { type: Type.STRING },
            distancia_pupilar: { type: Type.STRING },
            notes: { type: Type.STRING },
          },
          // (Opcional) si quieres “forzar” a que vengan siempre:
          // required: ["od_esfera","od_cilindro","od_eje","oi_esfera","oi_cilindro","oi_eje"],
        },
      },
    });

    const txt = getResponseText(response);
    if (!txt) return null;

    // A veces puede venir con whitespace; parse seguro
    try {
      return JSON.parse(txt) as PrescriptionJson;
    } catch {
      // Fallback: intenta extraer el primer JSON del texto
      const firstBrace = txt.indexOf("{");
      const lastBrace = txt.lastIndexOf("}");
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        const sliced = txt.slice(firstBrace, lastBrace + 1);
        return JSON.parse(sliced) as PrescriptionJson;
      }
      return null;
    }
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return null;
  }
}

/**
 * Recomendación basada en la receta (2 frases).
 */
export async function getSmartRecommendation(prescriptionData: any): Promise<string> {
  if (!hasKey) {
    return "Nuestros expertos recomiendan cristales con filtro azul y tratamiento antirreflejo.";
  }

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                `Receta (JSON): ${JSON.stringify(prescriptionData)}\n\n` +
                "Recomienda en 2 frases cortas y amigables el mejor material " +
                "(Policarbonato, Orgánico o Alto Índice) y tratamiento (Filtro Azul, Antirreflejo) " +
                "para este paciente. No uses listas, solo 2 frases.",
            },
          ],
        },
      ],
    });

    const txt = getResponseText(response);
    return txt || "Nuestros expertos recomiendan cristales con filtro azul y tratamiento antirreflejo.";
  } catch (error) {
    console.error("Gemini recommendation error:", error);
    return "Nuestros expertos recomiendan cristales con filtro azul y tratamiento antirreflejo para mayor nitidez y descanso visual.";
  }
}

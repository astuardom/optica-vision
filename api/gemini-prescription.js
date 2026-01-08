// api/gemini-prescription.js (Vercel Serverless Function)
// Usa GEMINI_API_KEY (server-side) y llama a Gemini vía REST.

import { stripDataUrlPrefix, json, readJsonBody, extractCandidateText, extractFirstJson } from './_utils.js';

const MODEL = 'gemini-2.0-flash';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return json(res, 500, { error: 'Missing GEMINI_API_KEY on server' });
  }

  const body = await readJsonBody(req);
  const imageBase64 = body?.imageBase64;
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return json(res, 400, { error: 'imageBase64 is required (string)' });
  }

  const cleanBase64 = stripDataUrlPrefix(imageBase64);
  if (!cleanBase64) {
    return json(res, 400, { error: 'imageBase64 is empty' });
  }

  const prompt =
    'Analiza esta receta óptica. Extrae el nombre del paciente (si aparece), ' +
    'Esfera (Sphere), Cilindro (Cylinder) y Eje (Axis) para OD y OI. ' +
    'Extrae la Adición (ADD) y la Distancia Pupilar (D.P. o PD). ' +
    'Responde estrictamente en JSON con estas claves: ' +
    'nombre, od_esfera, od_cilindro, od_eje, oi_esfera, oi_cilindro, oi_eje, adicion, distancia_pupilar, notes.';

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
              { text: prompt },
            ],
          },
        ],
      }),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return json(res, resp.status, {
        error: 'Gemini request failed',
        status: resp.status,
        details: data?.error || data,
      });
    }

    const text = extractCandidateText(data);
    const parsed = extractFirstJson(text);
    return json(res, 200, parsed);
  } catch (e) {
    return json(res, 500, { error: 'Unhandled server error', message: String(e?.message || e) });
  }
}

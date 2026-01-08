// api/gemini-recommendation.js (Vercel Serverless Function)
// Usa GEMINI_API_KEY (server-side) y llama a Gemini vía REST.

import { json, readJsonBody, extractCandidateText } from './_utils.js';

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
  const prescriptionData = body?.prescriptionData;

  const prompt =
    `Receta (JSON): ${JSON.stringify(prescriptionData || {})}\n\n` +
    'Recomienda en 2 frases cortas y amigables el mejor material ' +
    '(Policarbonato, Orgánico o Alto Índice) y tratamiento (Filtro Azul, Antirreflejo) ' +
    'para este paciente. No uses listas, solo 2 frases.';

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
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

    const text = extractCandidateText(data) || '';
    return json(res, 200, { text });
  } catch (e) {
    return json(res, 500, { error: 'Unhandled server error', message: String(e?.message || e) });
  }
}

// api/_utils.js
// Utilidades compartidas para las funciones de Vercel.

export function stripDataUrlPrefix(input) {
  if (!input) return '';
  const idx = String(input).indexOf('base64,');
  return idx >= 0 ? String(input).slice(idx + 7).trim() : String(input).trim();
}

export function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8') || '';
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function extractCandidateText(apiResponseJson) {
  // Gemini REST: candidates[0].content.parts[*].text
  const parts = apiResponseJson?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts.map((p) => p?.text).filter(Boolean).join('');
}

export function extractFirstJson(text) {
  if (!text) return null;
  const t = String(text).trim();
  try {
    return JSON.parse(t);
  } catch {
    const a = t.indexOf('{');
    const b = t.lastIndexOf('}');
    if (a >= 0 && b > a) {
      try {
        return JSON.parse(t.slice(a, b + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

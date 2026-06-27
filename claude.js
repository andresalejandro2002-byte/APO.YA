/**
 * APO.YA — Vercel Serverless Proxy para Anthropic API
 * 
 * Este archivo vive en /api/claude.js dentro del proyecto.
 * Vercel lo convierte automáticamente en un endpoint: /api/claude
 * 
 * La API key NUNCA sale al navegador — solo existe aquí en el servidor.
 * Configúrala en Vercel como variable de entorno: ANTHROPIC_API_KEY
 */

export default async function handler(req, res) {
  // ── Solo aceptar POST ──────────────────────────────────────────────────
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── CORS: permite solicitudes desde tu dominio de Vercel y localhost ───
  const allowedOrigins = [
    'https://apoya.vercel.app',        // cambia esto a tu dominio real
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5500',           // Live Server de VS Code
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ── Preflight OPTIONS ──────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ── Verificar que la API key esté configurada ──────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY no está configurada en las variables de entorno');
    return res.status(500).json({ 
      error: 'Servidor no configurado correctamente. Contacta al administrador.' 
    });
  }

  // ── Validar el body recibido del frontend ──────────────────────────────
  const { messages, max_tokens = 1000, model = 'claude-sonnet-4-6' } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Campo "messages" requerido y debe ser un array' });
  }

  // ── Límite de seguridad: máximo 2000 tokens por request ───────────────
  const safeMaxTokens = Math.min(max_tokens, 2000);

  // ── Llamada a Anthropic desde el servidor ─────────────────────────────
  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: safeMaxTokens,
        messages,
      }),
    });

    // ── Si Anthropic devuelve error, lo pasamos al cliente sin exponer la key
    if (!anthropicResponse.ok) {
      const errData = await anthropicResponse.json().catch(() => ({}));
      console.error('Error de Anthropic:', anthropicResponse.status, errData);
      return res.status(anthropicResponse.status).json({ 
        error: 'Error al procesar la solicitud de IA',
        details: errData?.error?.message || 'Error desconocido'
      });
    }

    const data = await anthropicResponse.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error('Error en el proxy:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

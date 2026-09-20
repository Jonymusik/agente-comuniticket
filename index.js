const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

// Claves abstraídas de forma segura
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = '5800933746'; 
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

app.post('/webhook', async (req, res) => {
  const asunto = req.body.subject || 'Solicitud de Divulgación General';
  const mensaje = req.body.message || 'Sin detalles específicos. Revisar el ticket.';
  const nombre = req.body.name || 'Funcionario Municipal';

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      chat_id: CHAT_ID, 
      text: `🚨 *Nuevo Ticket Recibido*\nDe: ${nombre}\nAsunto: ${asunto}\n\n⏳ _El Agente Estratega está analizando la solicitud..._`, 
      parse_mode: 'Markdown' 
    })
  });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = `Actúa como el Agente Estratega de comunicación pública de la Municipalidad de Orotina.
    Acabas de recibir esta solicitud de ticket:
    - Funcionario: ${nombre}
    - Asunto: ${asunto}
    - Detalles: ${mensaje}
    
    Analiza la información y genera una propuesta estratégica que incluya estrictamente:
    1. Estrategia AIDA (Atención, Interés, Deseo, Acción) resumida en un párrafo.
    2. Copy sugerido para un arte de 1080x1080 listo para Facebook/Instagram.
    3. Guion rápido para un Reel (formato vertical 9:16), indicando visuales sugeridos y texto en pantalla.
    
    Usa un tono institucional, claro, pero fresco y cercano a la comunidad ciudadana.`;

    const result = await model.generateContent(prompt);
    const respuestaIA = result.response.text();

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: respuestaIA })
    });

    res.status(200).send('Flujo completado');
  } catch (error) {
    console.error('Error procesando la IA:', error);
    res.status(500).send('Error interno');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor seguro en puerto ${PORT}`));

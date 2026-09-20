const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = '5800933746'; 
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

app.post('/webhook', async (req, res) => {
  console.log('🟢 PASO 1: Webhook recibido. Iniciando proceso...');
  const asunto = req.body.subject || 'Solicitud de Divulgación General';
  const mensaje = req.body.message || 'Sin detalles específicos. Revisar el ticket.';
  const nombre = req.body.name || 'Funcionario Municipal';

  try {
    console.log('🟢 PASO 2: Enviando primera alerta a Telegram...');
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: CHAT_ID, 
        text: `🚨 *Nuevo Ticket Recibido*\nDe: ${nombre}\nAsunto: ${asunto}\n\n⏳ _El Agente Estratega está analizando la solicitud..._`, 
        parse_mode: 'Markdown' 
      })
    });
    console.log('🟢 PASO 3: Primera alerta entregada.');
  } catch (err) {
    console.error('🔴 ERROR en PASO 2:', err);
  }

  try {
    console.log('🟢 PASO 4: Conectando con Gemini (gemini-pro)...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Actúa como el Agente Estratega de comunicación pública de la Municipalidad de Orotina. Acabas de recibir este ticket:
    Funcionario: ${nombre}
    Asunto: ${asunto}
    Detalles: ${mensaje}
    
    Genera una propuesta breve con: 1. Párrafo AIDA. 2. Copy para Facebook. 3. Guion de Reel.`;

    const result = await model.generateContent(prompt);
    const respuestaIA = result.response.text();
    console.log(`🟢 PASO 5: Gemini respondió con éxito. Longitud del texto: ${respuestaIA.length} caracteres.`);

    console.log('🟢 PASO 6: Enviando estrategia a Telegram...');
    const finalRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: respuestaIA })
    });
    const finalData = await finalRes.json();
    
    if (!finalData.ok) {
       console.error('🔴 PASO 7 ERROR DE TELEGRAM (Estrategia rechazada):', finalData);
    } else {
       console.log('🟢 PASO 7: Estrategia entregada en Telegram. PROCESO COMPLETADO.');
    }

    res.status(200).send('Flujo completado');
  } catch (error) {
    console.error('🔴 ERROR CRÍTICO procesando la IA:', error);
    res.status(500).send('Error interno');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor en línea en puerto ${PORT} (Modo Rastreador)`));

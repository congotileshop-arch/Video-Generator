const images = [null, null, null, null];

// Rasmlarni yuklash va oldindan ko‘rsatish (preview)
for (let i = 0; i < 4; i++) {
    document.getElementById(`img${i+1}`).addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    images[i] = img;
                    document.getElementById(`prev${i+1}`).style.backgroundImage = `url(${event.target.result})`;
                }
                img.src = event.target.result;
            }
            reader.readAsDataURL(file);
        }
    });
}

const canvas = document.getElementById('videoCanvas');
const ctx = canvas.getContext('2d');

document.getElementById('generateBtn').addEventListener('click', () => {
    if (images.some(img => img === null)) {
        alert("Iltimos, barcha 4 ta bo‘lim uchun rasm yuklang!");
        return;
    }

    startAnimationAndRecording();
});

function startAnimationAndRecording() {
    let frame = 0;
    const totalFrames = 150; // Taxminan 5 sekundlik video (30 fps)
    
    // Brauzerda videoni yozib olish uchun MediaRecorder
    const stream = canvas.captureStream(30);
    let recorder;
    try {
        recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    } catch (e) {
        recorder = new MediaRecorder(stream);
    }

    const chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = url;
        downloadLink.style.display = 'inline-block';
        downloadLink.textContent = "Videoni Yuklab Olish (.webm)";
        alert("Video muvaffaqiyatli tayyorlandi!");
    };

    recorder.start();

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const colWidth = canvas.width / 4;

        // 4 ta ustunni chizish va videodagidek sakrash effektini berish
        for (let i = 0; i < 4; i++) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(i * colWidth, 0, colWidth, canvas.height);
            ctx.clip();

            // Harakat effekti (ritm bo‘yicha yuqoriga-pastga sakrash)
            let bounce = Math.sin(frame * 0.2 + i) * 15;
            
            // Orqa fon ranglari (video uslubiga mos)
            const bgColors = ['#0284c7', '#ea580c', '#16a34a', '#9333ea'];
            ctx.fillStyle = bgColors[i];
            ctx.fillRect(i * colWidth, 0, colWidth, canvas.height);

            // Yuklangan rasmni doira yoki blok shaklida chizish
            let imgSize = 200;
            let xPos = i * colWidth + (colWidth - imgSize) / 2;
            let yPos = 200 + bounce;

            ctx.drawImage(images[i], xPos, yPos, imgSize, imgSize);

            // Pastdagi harakatlanuvchi platformalar (tile hop) simulyatsiyasi
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.fillRect(i * colWidth + 20, 1000 + (frame * 5) % 200, colWidth - 40, 40);

            ctx.restore();

            // Ustunlar orasidagi ajratuvchi chiziq
            if (i < 3) {
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo((i + 1) * colWidth, 0);
                ctx.lineTo((i + 1) * colWidth, canvas.height);
                ctx.stroke();
            }
        }

        frame++;
        if (frame < totalFrames) {
            requestAnimationFrame(draw);
        } else {
            recorder.stop();
        }
    }

    draw();
}

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isDrawing = false;
let points = [];
let bestAccuracy = 0;

const header = document.getElementById('header');
const accuracyDisplay = document.getElementById('accuracy');
const tagline = document.getElementById('tagline');

function calculateAccuracy(points) {
    if (points.length < 2) return 0;

    const centerX = (Math.min(...points.map(p => p.x)) + Math.max(...points.map(p => p.x))) / 2;
    const centerY = (Math.min(...points.map(p => p.y)) + Math.max(...points.map(p => p.y))) / 2;

    const distances = points.map(p => Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2));
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;

    const deviation = distances.map(d => Math.abs(d - avgDistance));
    const avgDeviation = deviation.reduce((a, b) => a + b, 0) / deviation.length;

    return Math.max(0, 100 - (avgDeviation / avgDistance) * 100);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.strokeStyle = 'red';
        const accuracy = calculateAccuracy(points);
        if (accuracy >= 90) ctx.strokeStyle = 'green';
        else if (accuracy >= 80) ctx.strokeStyle = 'yellow';

        ctx.lineWidth = 5;
        ctx.stroke();
    }
}

canvas.addEventListener('mousedown', () => {
    isDrawing = true;
    points = [];
    tagline.style.display = 'none';
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;

    points.push({ x: e.clientX, y: e.clientY });
    draw();

    const accuracy = calculateAccuracy(points);
    accuracyDisplay.textContent = `${accuracy.toFixed(1)}%`;

    if (accuracy >= 90) document.body.style.backgroundColor = '';
    else document.body.style.backgroundColor = 'black';
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;

    if (points.length > 1) {
        const accuracy = calculateAccuracy(points);
        accuracyDisplay.textContent = `${accuracy.toFixed(1)}%`;

        if (accuracy > bestAccuracy) {
            bestAccuracy = accuracy;
            tagline.textContent = `Best: ${bestAccuracy.toFixed(1)}%`;
        }

        const start = points[0];
        const end = points[points.length - 1];
        const distance = Math.hypot(start.x - end.x, start.y - end.y);

        if (distance > 20) {
            new Audio('bip.mp3').play(); // Play bip sound
        } else {
            new Audio('win.mp3').play(); // Play win sound
        }
    }
});

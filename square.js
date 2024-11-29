const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isDrawing = false;
let points = [];
let bestAccuracy = 0;

let showGridlines = true;
let showGuideSquare = true;

const header = document.getElementById('header');
const accuracyDisplay = document.getElementById('accuracy');
const tagline = document.getElementById('tagline');

// Toggle buttons
const toggleGridButton = document.getElementById('toggle-grid');
const toggleGuideButton = document.getElementById('toggle-guide');

// Toggle gridlines
toggleGridButton.addEventListener('click', () => {
    showGridlines = !showGridlines;
    toggleGridButton.textContent = showGridlines ? 'Disable Gridlines' : 'Enable Gridlines';
    draw();
});

// Toggle guide square
toggleGuideButton.addEventListener('click', () => {
    showGuideSquare = !showGuideSquare;
    toggleGuideButton.textContent = showGuideSquare ? 'Disable Guide Square' : 'Enable Guide Square';
    draw();
});

// Relaxed square accuracy calculation
function calculateSquareAccuracy(points) {
    if (points.length < 4) return 0;

    const distances = [];
    const center = points.reduce(
        (acc, point) => ({
            x: acc.x + point.x / points.length,
            y: acc.y + point.y / points.length,
        }),
        { x: 0, y: 0 }
    );

    for (let i = 0; i < points.length; i++) {
        const dx = points[i].x - center.x;
        const dy = points[i].y - center.y;
        distances.push(Math.sqrt(dx * dx + dy * dy));
    }

    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    const deviations = distances.map(d => Math.abs(d - avgDistance));
    const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;

    return Math.max(0, 100 - (avgDeviation / avgDistance) * 50); // Easier tolerance
}

// Draw gridlines and guide square
function drawGuide() {
    if (showGridlines) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;

        // Draw gridlines
        for (let x = 0; x < canvas.width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    if (showGuideSquare) {
        // Draw guide square in the center
        const squareSize = 200;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            centerX - squareSize / 2,
            centerY - squareSize / 2,
            squareSize,
            squareSize
        );
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the guide square and grid
    drawGuide();

    if (points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.strokeStyle = 'red';
        const accuracy = calculateSquareAccuracy(points);
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

    const accuracy = calculateSquareAccuracy(points);
    accuracyDisplay.textContent = `${accuracy.toFixed(1)}%`;

    if (accuracy >= 90) {
        accuracyDisplay.style.color = 'green';
    } else {
        accuracyDisplay.style.color = 'red';
        document.body.style.backgroundColor = 'black';
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;

    if (points.length > 1) {
        const accuracy = calculateSquareAccuracy(points);
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

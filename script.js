const canvas = document.getElementById('fieldCanvas');
const ctx = canvas.getContext('2d');

const q1Input = document.getElementById('q1Input');
const q2Input = document.getElementById('q2Input');
const distanceInput = document.getElementById('distanceInput');
const forceOutput = document.getElementById('forceOutput');

// Coulomb constant
const k = 8.99e9;

function getCharges() {
  return {
    q1: parseFloat(q1Input.value) * 1e-6, // µC → C
    q2: parseFloat(q2Input.value) * 1e-6, // µC → C
    distance: parseFloat(distanceInput.value) * 100 // m → px (scale)
  };
}

function drawCharge(x, y, q) {
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, 2 * Math.PI);
  ctx.fillStyle = q > 0 ? 'red' : 'blue';
  ctx.fill();

  ctx.fillStyle = 'white';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((q > 0 ? '+' : '') + (q * 1e6).toFixed(1), x, y);
}

function drawArrowhead(x, y, dx, dy) {
  const size = 5;
  const angle = Math.atan2(dy, dx);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - size * Math.cos(angle - Math.PI / 6), y - size * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(x, y);
  ctx.lineTo(x - size * Math.cos(angle + Math.PI / 6), y - size * Math.sin(angle + Math.PI / 6));
  ctx.stroke();
}

function drawField(charges) {
  const spacing = 25;
  for (let x = 0; x < canvas.width; x += spacing) {
    for (let y = 0; y < canvas.height; y += spacing) {
      let Ex = 0, Ey = 0;

      for (let c of charges) {
        const dx = x - c.x;
        const dy = y - c.y;
        const r2 = dx * dx + dy * dy;
        if (r2 < 200) continue;
        const r = Math.sqrt(r2);
        const E = c.q / r2;
        Ex += E * dx / r;
        Ey += E * dy / r;
      }

      const len = Math.sqrt(Ex * Ex + Ey * Ey);
      if (len === 0) continue;

      const scale = 12 / len;
      const dx = Ex * scale;
      const dy = Ey * scale;

      ctx.strokeStyle = "blue";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dx, y + dy);
      ctx.stroke();

      drawArrowhead(x + dx, y + dy, dx, dy);
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const { q1, q2, distance } = getCharges();
  const midX = canvas.width / 2;
  const midY = canvas.height / 2;

  // Place charges along x-axis
  const c1 = { x: midX - distance / 2, y: midY, q: q1 };
  const c2 = { x: midX + distance / 2, y: midY, q: q2 };

  drawField([c1, c2]);
  drawCharge(c1.x, c1.y, q1);
  drawCharge(c2.x, c2.y, q2);

  // Coulomb force
  const dMeters = parseFloat(distanceInput.value);
  const force = k * Math.abs(q1 * q2) / (dMeters * dMeters);
  forceOutput.textContent = `Force: ${force.toExponential(3)} N (${q1*q2>0 ? "Repulsive" : "Attractive"})`;
}

// Redraw when input changes
[q1Input, q2Input, distanceInput].forEach(inp => {
  inp.addEventListener('input', draw);
});

draw();

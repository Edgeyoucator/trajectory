const heightSlider = document.getElementById('heightSlider');
const velocitySlider = document.getElementById('velocitySlider');
const heightValue = document.getElementById('heightValue');
const velocityValue = document.getElementById('velocityValue');

const ball = document.getElementById('ball');
const bucket = document.getElementById('bucket');
const bucketLabel = document.getElementById('bucketLabel');
const launchBtn = document.getElementById('launchBtn');
const timerDisplay = document.getElementById('timer');
const trailContainer = document.getElementById('trail-container');

let animationId;
let startTime = null;
let lastTrailTime = 0;
let falling = false;
let streak = 0;

const ballRadius = 10;
const g = 9.8;

function updateSliderDisplays() {
  heightValue.textContent = heightSlider.value;
  velocityValue.textContent = velocitySlider.value;
}

heightSlider.addEventListener('input', () => {
  updateSliderDisplays();
  updateBallPosition();
});

velocitySlider.addEventListener('input', updateSliderDisplays);

function updateBallPosition() {
  const height = parseFloat(heightSlider.value);
  const gridHeight = document.getElementById('grid-area').clientHeight;
  const pxPerMeter = gridHeight / 20;
  const yPx = height * pxPerMeter;
  ball.style.bottom = `${yPx}px`;
  ball.style.left = `${ballRadius}px`;
}

function leaveTrail(xPx, yPx) {
  const dot = document.createElement('div');
  dot.className = 'trail-dot';
  dot.style.left = `${xPx}px`;
  dot.style.bottom = `${yPx}px`;
  trailContainer.appendChild(dot);
}

function positionBucket() {
  const grid = document.getElementById('grid-area');
  const gridWidth = grid.clientWidth;
  const randX = Math.floor(Math.random() * (gridWidth - 80)) + 40;
  bucket.style.left = `${randX}px`;
  bucket.dataset.targetX = randX;

  const pxPerMeter = grid.clientHeight / 20;
  const xMeters = ((randX - ballRadius) / pxPerMeter).toFixed(1);
  bucketLabel.textContent = `${xMeters} m`;
  bucketLabel.style.left = `${randX}px`;
}

function showMessage(text, color = 'rgba(134, 218, 189, 0.9)') {
  const msg = document.createElement('div');
  msg.textContent = text;
  msg.style.position = 'absolute';
  msg.style.top = '300px';
  msg.style.left = '50%';
  msg.style.transform = 'translateX(-50%)';
  msg.style.backgroundColor = color;
  msg.style.color = '#162237';
  msg.style.padding = '0.5rem 1rem';
  msg.style.borderRadius = '8px';
  msg.style.zIndex = '999';
  msg.style.backdropFilter = 'blur(2px)';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 2000);
}

function showWinMessage() {
  showMessage('🏆 You Win!', 'rgba(0, 255, 153, 0.9)');
}

function resetForNextRound() {
  ball.style.left = `${ballRadius}px`;
  ball.style.bottom = `0px`;
  timerDisplay.textContent = `⏱ 0.00s`;
  trailContainer.innerHTML = '';
  falling = false;
}

launchBtn.addEventListener('click', () => {
  if (falling) return;
  if (launchBtn.disabled) {
    streak = 0;
    launchBtn.disabled = false;
    positionBucket();
  }

  falling = true;
  startTime = null;
  lastTrailTime = 0;
  trailContainer.innerHTML = '';

  const height = parseFloat(heightSlider.value);
  const velocityX = parseFloat(velocitySlider.value);
  const gridHeight = document.getElementById('grid-area').clientHeight;
  const pxPerMeter = gridHeight / 20;

  const startY = height * pxPerMeter;
  ball.style.left = `${ballRadius}px`;
  ball.style.bottom = `${startY}px`;
  timerDisplay.textContent = `⏱ 0.00s`;
  leaveTrail(ballRadius, startY);

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const t = (timestamp - startTime) / 1000;

    const y = height - 0.5 * g * t * t;
    const x = velocityX * t;
    const yClamped = Math.max(0, y);
    const yPx = yClamped * pxPerMeter;
    const xPx = x * pxPerMeter + ballRadius;

    ball.style.bottom = `${yPx}px`;
    ball.style.left = `${xPx}px`;
    timerDisplay.textContent = `⏱ ${t.toFixed(2)}s`;

    if (timestamp - lastTrailTime > 50 && y > 0) {
      leaveTrail(xPx, yPx);
      lastTrailTime = timestamp;
    }

    if (y <= 0) {
      falling = false;

      const bucketX = parseFloat(bucket.dataset.targetX);
      const hit = xPx >= bucketX - 20 && xPx <= bucketX + 20;

      if (hit) {
        streak++;
        if (streak >= 3) {
          showWinMessage();
          launchBtn.disabled = true;
        } else {
          showMessage(`🎯 Hit! Streak: ${streak}`, 'rgba(134, 218, 189, 0.9)');
          positionBucket();
        }
      } else {
        streak = 0;
        showMessage('❌ Miss. Score reset.', 'rgba(237, 95, 4, 0.7)');
      }

      return;
    }

    animationId = requestAnimationFrame(animate);
  }

  animationId = requestAnimationFrame(animate);
});

updateSliderDisplays();
updateBallPosition();
positionBucket();

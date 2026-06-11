const acceptBtn = document.getElementById("acceptBtn");
const rejectBtn = document.getElementById("rejectBtn");
const popup = document.getElementById("popup");
const messageText = document.getElementById("messageText");
const startGameBtn = document.getElementById("startGameBtn");
const gameArea = document.getElementById("gameArea");
const scoreText = document.getElementById("score");
const timeText = document.getElementById("time");
const envelope = document.getElementById("envelope");
const letterPopup = document.getElementById("letterPopup");
const musicBtn = document.getElementById("musicBtn");
const teddy = document.getElementById("teddy");
const hugHeart = document.getElementById("hugHeart");
const hugMsg = document.getElementById("hugMsg");
const attemptCounter = document.getElementById("attemptCounter");
const rejectFunnyMsg = document.getElementById("rejectFunnyMsg");
const megaSorryPopup = document.getElementById("megaSorryPopup");
const megaAcceptBtn = document.getElementById("megaAcceptBtn");

const isMobile = window.matchMedia("(max-width: 768px)").matches;
const rejectLimit = isMobile ? 5 : 100;

let rejectCount = 0;
let megaSorryShown = false;
let score = 0;
let timeLeft = 20;
let gameRunning = false;
let gameTimer;
let heartSpawner;
let audioStarted = false;
let audioContext;
let oscillator;
let gainNode;
let teddySelected = false;

const cuteMessages = [
  "I know I made a mistake. You mean a lot to me 💕",
  "Please forgive me, I really don't like seeing you upset 🥺",
  "Your smile is my favorite thing in the world ❤️",
  "I promise I will try to be better for you 🌸",
  "One chance please? I will make it worth it 🥹",
  "I miss your smile. Please don't stay angry 💖"
];

const funnyRejectTexts = [
  "Reject 😤",
  "Nope 😜",
  "Catch me 😂",
  "Not allowed 😭",
  "Just accept na 🥺",
  "You can't reject this 💘",
  "Still trying? 😆"
];

const funnyAttemptMessages = [
  "Nice try 😜",
  "Still not happening 😂",
  "You're persistent 😭",
  "Almost caught me 😆",
  "No rejection allowed 🥺",
  "Forgiveness loading... 💕",
  "Try harder 😂",
  "Button has trust issues 😭"
];

let msgIndex = 0;

setInterval(() => {
  msgIndex = (msgIndex + 1) % cuteMessages.length;
  messageText.style.opacity = 0;

  setTimeout(() => {
    messageText.innerText = cuteMessages[msgIndex];
    messageText.style.opacity = 1;
  }, 300);
}, 2600);

acceptBtn.addEventListener("click", () => {
  popup.style.display = "flex";
  createFloatingHearts();
  heartBurst(window.innerWidth / 2, window.innerHeight / 2);
  createConfetti();
});

function closePopup() {
  popup.style.display = "none";
}
window.closePopup = closePopup;

/* Desktop: cursor near button */
/* Mobile: tap reject button */
document.addEventListener("pointermove", (e) => {
  if (isMobile) return;

  handleRejectMovement(e.clientX, e.clientY);
  createCursorTrail(e.clientX, e.clientY);
});

rejectBtn.addEventListener("click", (e) => {
  e.preventDefault();
  moveRejectButton();
});

rejectBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveRejectButton();
});

function handleRejectMovement(pointerX, pointerY) {
  if (megaSorryShown) return;

  const rect = rejectBtn.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const distance = Math.hypot(pointerX - centerX, pointerY - centerY);

  if (distance < 155) {
    moveRejectButton();
  }
}

function moveRejectButton() {
  if (megaSorryShown) return;

  rejectCount++;

  attemptCounter.innerText = "Attempts to reject: " + rejectCount;
  rejectFunnyMsg.innerText =
    funnyAttemptMessages[rejectCount % funnyAttemptMessages.length];

  if (rejectCount >= rejectLimit) {
    megaSorryShown = true;
    megaSorryPopup.style.display = "flex";
    rejectBtn.style.display = "none";

    createConfetti();
    createFloatingHearts();
    heartBurst(window.innerWidth / 2, window.innerHeight / 2);
    return;
  }

  if (rejectCount >= 30) {
    rejectBtn.innerText = "Okay, maybe forgive me? 🥺";
  } else if (rejectCount >= 20) {
    rejectBtn.innerText = "tiny reject 🥺";
    rejectBtn.classList.add("tiny-reject");
  } else {
    rejectBtn.innerText = funnyRejectTexts[rejectCount % funnyRejectTexts.length];
  }

  const padding = 20;
  const btnWidth = rejectBtn.offsetWidth;
  const btnHeight = rejectBtn.offsetHeight;

  const maxX = window.innerWidth - btnWidth - padding;
  const maxY = window.innerHeight - btnHeight - padding;

  const randomX = Math.max(
    padding,
    Math.random() * (maxX - padding) + padding
  );

  const randomY = Math.max(
    padding,
    Math.random() * (maxY - padding) + padding
  );

  rejectBtn.style.left = randomX + "px";
  rejectBtn.style.top = randomY + "px";
}

megaAcceptBtn.addEventListener("click", () => {
  megaSorryPopup.style.display = "none";
  popup.style.display = "flex";

  createConfetti();
  createFloatingHearts();
  heartBurst(window.innerWidth / 2, window.innerHeight / 2);
});

/* Catch hearts game */
startGameBtn.addEventListener("click", startGame);

function startGame() {
  if (gameRunning) return;

  score = 0;
  timeLeft = 20;
  gameRunning = true;

  scoreText.innerText = score;
  timeText.innerText = timeLeft;
  gameArea.innerHTML = "";
  startGameBtn.innerText = "Game Running 💕";

  heartSpawner = setInterval(spawnGameHeart, 550);

  gameTimer = setInterval(() => {
    timeLeft--;
    timeText.innerText = timeLeft;

    if (score >= 15) endGame(true);
    if (timeLeft <= 0) endGame(score >= 15);
  }, 1000);
}

function spawnGameHeart() {
  const heart = document.createElement("div");

  heart.className = "game-heart";
  heart.innerText = ["❤️", "💕", "💖", "💗"][Math.floor(Math.random() * 4)];
  heart.style.left = Math.random() * (gameArea.clientWidth - 35) + "px";

  let clicked = false;

  heart.addEventListener("click", (e) => {
    e.preventDefault();

    if (clicked) return;
    clicked = true;

    score++;
    scoreText.innerText = score;

    heart.style.pointerEvents = "none";
    heart.remove();

    if (score >= 15) endGame(true);
  });

  heart.addEventListener("touchstart", (e) => {
    e.preventDefault();

    if (clicked) return;
    clicked = true;

    score++;
    scoreText.innerText = score;

    heart.style.pointerEvents = "none";
    heart.remove();

    if (score >= 15) endGame(true);
  });

  gameArea.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 3000);
}

function endGame(win) {
  clearInterval(gameTimer);
  clearInterval(heartSpawner);

  gameRunning = false;
  startGameBtn.innerText = "Play Again 💖";

  if (win) {
    messageText.innerText = "You caught all my love! Now please forgive me ❤️";
    heartBurst(window.innerWidth / 2, window.innerHeight / 2);
  } else {
    messageText.innerText = "Almost! Try again and catch my love 🥺";
  }
}

/* Mobile-friendly teddy hug */
teddy.addEventListener("click", () => {
  teddySelected = true;
  teddy.classList.add("selected");
  hugMsg.innerText = "Now tap the heart 💗";
});

hugHeart.addEventListener("click", () => {
  if (!teddySelected) {
    hugMsg.innerText = "First tap teddy 🐻";
    return;
  }

  teddySelected = false;
  teddy.classList.remove("selected");
  hugHeart.classList.add("hugged");
  hugHeart.innerText = "💞";
  hugMsg.innerText = "Teddy hugged your heart 🐻❤️";

  heartBurst(window.innerWidth / 2, window.innerHeight / 2);
});

envelope.addEventListener("click", () => {
  letterPopup.style.display = "flex";
});

function closeLetter() {
  letterPopup.style.display = "none";
}
window.closeLetter = closeLetter;

musicBtn.addEventListener("click", () => {
  if (!audioStarted) {
    startMusic();
    musicBtn.innerText = "🔇 Stop";
  } else {
    stopMusic();
    musicBtn.innerText = "🎵 Music";
  }
});

function startMusic() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  oscillator = audioContext.createOscillator();
  gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(432, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  audioStarted = true;
}

function stopMusic() {
  if (oscillator) oscillator.stop();
  audioStarted = false;
}

function createFloatingHearts() {
  for (let i = 0; i < 35; i++) {
    const heart = document.createElement("div");

    heart.className = "heart";
    heart.innerText =
      ["❤️", "💕", "💖", "💗", "💘"][Math.floor(Math.random() * 5)];

    heart.style.left = Math.random() * 100 + "vw";
    heart.style.animationDuration = Math.random() * 3 + 4 + "s";

    document.body.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 8000);
  }
}

function heartBurst(x, y) {
  for (let i = 0; i < 40; i++) {
    const heart = document.createElement("div");

    heart.className = "burst-heart";
    heart.innerText =
      ["❤️", "💕", "💖", "💗", "💘"][Math.floor(Math.random() * 5)];

    heart.style.left = x + "px";
    heart.style.top = y + "px";

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 230 + 70;

    heart.style.setProperty("--x", Math.cos(angle) * distance + "px");
    heart.style.setProperty("--y", Math.sin(angle) * distance + "px");

    document.body.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 1300);
  }
}

function createConfetti() {
  const colors = ["#ff4f8b", "#ffffff", "#ffd166", "#7c3aed", "#00f5ff"];

  for (let i = 0; i < 90; i++) {
    const confetti = document.createElement("div");

    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.top = "-20px";
    confetti.style.background =
      colors[Math.floor(Math.random() * colors.length)];

    confetti.style.animationDuration = Math.random() * 1.5 + 1.5 + "s";

    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.remove();
    }, 3000);
  }
}

function createCursorTrail(x, y) {
  if (Math.random() > 0.55) return;

  const trail = document.createElement("div");

  trail.className = "trail";
  trail.innerText = "💖";
  trail.style.left = x + "px";
  trail.style.top = y + "px";

  document.body.appendChild(trail);

  setTimeout(() => {
    trail.remove();
  }, 800);
}

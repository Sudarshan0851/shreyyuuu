/* =====================================================
   BIRTHDAY WEBSITE — MAIN SCRIPT
   Vanilla JS only. No dependencies.
===================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------
     CONFIG
  --------------------------------------------------- */
  const PASSWORD = "beautifullpartoflife";
  const BIRTHDAY_MONTH = 6; // July (0-indexed)
  const BIRTHDAY_DAY = 16;
  const FIREWORKS_DURATION = 6000; // ms

  const LETTER_TEXT =
`Many many happy returns of the day shreyya! 🥳❤️

Firstly... Tula sangaych tar tu majhya sathi khup khup jast 
special ahes..

tu jevha pasun maja life madhi ali ahes mi kharach khup happy rahto
ani i always want to see you happy tu hastani khup chan distis bagh atta kashi 
smile ahe tashich rahude kayam ...

and hoo alway remember tu tu ahe tujhi jaga koni nahi gheu shakat
your the bestest person i ever seen ... kahi lokana je milt tyachi kalji nahi rahat
but tu akhya duniye madhi majasathi khup special ahe ...

jevha apan bollo hoto tu mhane ki serious nako hou mi tr tyacha adhi pasun tujha premat ahe
but tujh past hot mala tyatun tula baher kadhaych hot...
tu majhi sath de mala energy de mi duniya paltun taken tujha sathi 

bala khup khup khupp khup infinte prem re tula pilla sada anandi rahay 
ani i wish ki mi lavkarach tula bhetayla yeil....

baccha ani kayam lakshat thev tujha sathi mi kadhipn asel 
duniya jaha tula radvel pn i lovee youuu my sweetest person 
and I always want to see you...

Happy
Smiling
Laughing
Blushing

God bless you always.
Never stop smiling.

Happy Birthday to the most beautiful part of my life ❤️ shreyuu`;

  /* ---------------------------------------------------
     DOM REFERENCES
  --------------------------------------------------- */
  const screens = {
    password: document.getElementById("password-screen"),
    countdown: document.getElementById("countdown-screen"),
    fireworks: document.getElementById("fireworks-screen"),
    birthday: document.getElementById("birthday-screen"),
    envelope: document.getElementById("envelope-screen"),
    letter: document.getElementById("letter-screen"),
    ending: document.getElementById("ending-screen"),
  };

  const passwordForm = document.getElementById("password-form");
  const passwordInput = document.getElementById("password-input");
  const wrongMsg = document.getElementById("wrong-password-msg");

  const cdDays = document.getElementById("cd-days");
  const cdHours = document.getElementById("cd-hours");
  const cdMinutes = document.getElementById("cd-minutes");
  const cdSeconds = document.getElementById("cd-seconds");

  const openLetterBtn = document.getElementById("open-letter-btn");
  const envelopeEl = document.getElementById("envelope");

  const letterPaperEl = document.querySelector(".letter-paper");
  const typewriterTextEl = document.getElementById("typewriter-text");
  const typewriterCursorEl = document.getElementById("typewriter-cursor");

  const musicToggleBtn = document.getElementById("music-toggle");
  const bgMusic = document.getElementById("bg-music");

  /* ---------------------------------------------------
     SCREEN NAVIGATION
  --------------------------------------------------- */
  function showScreen(name) {
    Object.values(screens).forEach((el) => {
      if (!el) return;
      el.classList.remove("active");
    });
    const target = screens[name];
    if (target) {
      target.classList.add("active");
    }
  }

  /* ---------------------------------------------------
     STARFIELD CANVAS (ambient background)
  --------------------------------------------------- */
  const starsCanvas = document.getElementById("stars-canvas");
  const starsCtx = starsCanvas.getContext("2d");
  let stars = [];

  function resizeStarsCanvas() {
    starsCanvas.width = window.innerWidth;
    starsCanvas.height = window.innerHeight;
  }

  function initStars() {
    resizeStarsCanvas();
    const count = Math.min(160, Math.floor((window.innerWidth * window.innerHeight) / 9000));
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * starsCanvas.width,
        y: Math.random() * starsCanvas.height,
        r: Math.random() * 1.4 + 0.3,
        baseAlpha: Math.random() * 0.6 + 0.25,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function drawStars(time) {
    starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
    for (const s of stars) {
      const alpha = s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.phase) * 0.3;
      starsCtx.beginPath();
      starsCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      starsCtx.fillStyle = `rgba(255,255,255,${Math.max(0, Math.min(1, alpha))})`;
      starsCtx.fill();
    }
    requestAnimationFrame(drawStars);
  }

  /* ---------------------------------------------------
     FLOATING PARTICLES (hearts + dust)
  --------------------------------------------------- */
  const particlesContainer = document.getElementById("particles-container");
  const HEART_CHARS = ["❤️", "💗", "💖", "✨"];

  function spawnFloatingParticle() {
    const isDust = Math.random() < 0.55;
    const el = document.createElement("div");
    el.className = "floating-particle" + (isDust ? " dust" : "");
    if (!isDust) {
      el.textContent = HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)];
      el.style.fontSize = 12 + Math.random() * 16 + "px";
    }
    const startX = Math.random() * 100;
    const duration = 10 + Math.random() * 12;
    const drift = (Math.random() - 0.5) * 160;
    el.style.left = startX + "vw";
    el.style.setProperty("--drift", drift + "px");
    el.style.animationDuration = duration + "s";
    particlesContainer.appendChild(el);
    setTimeout(() => el.remove(), duration * 1000 + 500);
  }

  function startParticleLoop() {
    spawnFloatingParticle();
    setInterval(spawnFloatingParticle, 650);
  }

  /* ---------------------------------------------------
     PASSWORD SCREEN LOGIC
  --------------------------------------------------- */
  function handlePasswordSubmit(e) {
    e.preventDefault();
    const value = passwordInput.value.trim();

    if (value === PASSWORD) {
      wrongMsg.classList.remove("show");
      passwordInput.classList.remove("shake");
      enterExperience();
    } else {
      wrongMsg.classList.add("show");
      passwordInput.classList.remove("shake");
      // force reflow to restart animation
      void passwordInput.offsetWidth;
      passwordInput.classList.add("shake");
    }
  }

  /* ---------------------------------------------------
     BIRTHDAY TARGET DATE LOGIC
  --------------------------------------------------- */
  function getNextBirthdayDate() {
    const now = new Date();
    let year = now.getFullYear();
    let target = new Date(year, BIRTHDAY_MONTH, BIRTHDAY_DAY, 0, 0, 0, 0);
    if (now.getTime() >= target.getTime()) {
      // Birthday already happened/started this year, but we only roll
      // forward if we're past the whole day. If it's currently the
      // birthday, treat as arrived (handled by caller).
      const endOfBirthday = new Date(year, BIRTHDAY_MONTH, BIRTHDAY_DAY, 23, 59, 59, 999);
      if (now.getTime() > endOfBirthday.getTime()) {
        target = new Date(year + 1, BIRTHDAY_MONTH, BIRTHDAY_DAY, 0, 0, 0, 0);
      }
    }
    return target;
  }

  function isBirthdayToday() {
    const now = new Date();
    return now.getMonth() === BIRTHDAY_MONTH && now.getDate() === BIRTHDAY_DAY;
  }

  let countdownInterval = null;

  function startCountdown() {
    showScreen("countdown");
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
  }

  function updateCountdown() {
    if (isBirthdayToday()) {
      clearInterval(countdownInterval);
      cdDays.textContent = "00";
      cdHours.textContent = "00";
      cdMinutes.textContent = "00";
      cdSeconds.textContent = "00";
      launchFireworksSequence();
      return;
    }

    const target = getNextBirthdayDate();
    const now = new Date();
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      clearInterval(countdownInterval);
      launchFireworksSequence();
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    cdDays.textContent = String(days).padStart(2, "0");
    cdHours.textContent = String(hours).padStart(2, "0");
    cdMinutes.textContent = String(minutes).padStart(2, "0");
    cdSeconds.textContent = String(seconds).padStart(2, "0");
  }

  /* ---------------------------------------------------
     ENTRY POINT AFTER PASSWORD SUCCESS
  --------------------------------------------------- */
  function enterExperience() {
    if (isBirthdayToday()) {
      launchFireworksSequence();
    } else {
      startCountdown();
    }
  }

  /* ---------------------------------------------------
     FIREWORKS + CONFETTI + HEARTS SEQUENCE
  --------------------------------------------------- */
  const fireworksCanvas = document.getElementById("fireworks-canvas");
  const fireworksCtx = fireworksCanvas.getContext("2d");
  const confettiContainer = document.getElementById("confetti-container");
  const heartsBurstContainer = document.getElementById("hearts-burst-container");

  let fireworkParticles = [];
  let fireworksAnimId = null;
  let fireworksSpawnTimer = null;
  let confettiTimer = null;
  let heartsTimer = null;

  const CONFETTI_COLORS = ["#ff6fa5", "#ffb3cf", "#ffffff", "#b06bff", "#ffd6e6"];

  function resizeFireworksCanvas() {
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
  }

  function createFirework() {
    const x = Math.random() * fireworksCanvas.width;
    const y = Math.random() * fireworksCanvas.height * 0.5 + 40;
    const particleCount = 46;
    const hue = [330, 340, 350, 0, 300][Math.floor(Math.random() * 5)];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = Math.random() * 3.5 + 1.5;
      fireworkParticles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: Math.random() * 0.012 + 0.012,
        color: `hsl(${hue + Math.random() * 20 - 10}, 90%, ${65 + Math.random() * 20}%)`,
        size: Math.random() * 2 + 1.4,
      });
    }
  }

  function animateFireworks() {
    fireworksCtx.fillStyle = "rgba(5, 3, 10, 0.22)";
    fireworksCtx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    for (let i = fireworkParticles.length - 1; i >= 0; i--) {
      const p = fireworkParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02; // gravity
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        fireworkParticles.splice(i, 1);
        continue;
      }

      fireworksCtx.beginPath();
      fireworksCtx.globalAlpha = Math.max(0, p.alpha);
      fireworksCtx.fillStyle = p.color;
      fireworksCtx.shadowBlur = 12;
      fireworksCtx.shadowColor = p.color;
      fireworksCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      fireworksCtx.fill();
    }
    fireworksCtx.globalAlpha = 1;
    fireworksCtx.shadowBlur = 0;

    fireworksAnimId = requestAnimationFrame(animateFireworks);
  }

  function spawnConfettiPiece() {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.left = Math.random() * 100 + "vw";
    el.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    el.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    const duration = 3 + Math.random() * 2.5;
    el.style.animationDuration = duration + "s";
    el.style.transform = `rotate(${Math.random() * 360}deg)`;
    confettiContainer.appendChild(el);
    setTimeout(() => el.remove(), duration * 1000 + 300);
  }

  function spawnBurstHeart() {
    const el = document.createElement("div");
    el.className = "heart-burst";
    el.textContent = HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)];
    el.style.left = Math.random() * 100 + "vw";
    const duration = 3.5 + Math.random() * 2;
    el.style.animationDuration = duration + "s";
    heartsBurstContainer.appendChild(el);
    setTimeout(() => el.remove(), duration * 1000 + 300);
  }

  function launchFireworksSequence() {
    showScreen("fireworks");
    resizeFireworksCanvas();
    fireworkParticles = [];
    fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    animateFireworks();

    // Spawn multiple fireworks bursts
    createFirework();
    fireworksSpawnTimer = setInterval(() => {
      createFirework();
      if (Math.random() > 0.4) createFirework();
    }, 420);

    // Confetti rain
    confettiTimer = setInterval(spawnConfettiPiece, 90);

    // Floating hearts
    heartsTimer = setInterval(spawnBurstHeart, 260);

    setTimeout(stopFireworksSequence, FIREWORKS_DURATION);
  }

  function stopFireworksSequence() {
    clearInterval(fireworksSpawnTimer);
    clearInterval(confettiTimer);
    clearInterval(heartsTimer);
    cancelAnimationFrame(fireworksAnimId);
    fireworkParticles = [];
    goToBirthdayScreen();
  }

  function goToBirthdayScreen() {
    showScreen("birthday");
    // restart fade-item animations in case of re-entry
    document.querySelectorAll("#birthday-screen .fade-item").forEach((el) => {
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
    });
  }

  /* ---------------------------------------------------
     ENVELOPE INTERACTION
  --------------------------------------------------- */
  function handleOpenLetterClick() {
    showScreen("envelope");
  }

  function handleEnvelopeClick() {
    if (envelopeEl.classList.contains("opened")) return;
    envelopeEl.classList.add("opened");
    setTimeout(() => {
      showScreen("letter");
      revealLetter();
    }, 1300);
  }

  /* ---------------------------------------------------
     LETTER TYPEWRITER
  --------------------------------------------------- */
  let typewriterTimer = null;

  function revealLetter() {
    letterPaperEl.classList.add("visible");
    typewriterTextEl.textContent = "";
    typewriterCursorEl.classList.remove("hidden");

    let index = 0;
    const speed = 32; // ms per character

    function typeNext() {
      if (index < LETTER_TEXT.length) {
        typewriterTextEl.textContent += LETTER_TEXT.charAt(index);
        index++;
        // scroll paper as text grows
        letterPaperEl.scrollTop = letterPaperEl.scrollHeight;
        const char = LETTER_TEXT.charAt(index - 1);
        const delay = char === "\n" ? speed * 6 : speed;
        typewriterTimer = setTimeout(typeNext, delay);
      } else {
        typewriterCursorEl.classList.add("hidden");
        const hint = document.createElement("p");
        hint.innerHTML = "✨ Tap anywhere to continue ✨";
        hint.className = "tap-hint";

        letterPaperEl.appendChild(hint);

        letterPaperEl.addEventListener("click", goToEndingScreen, { once: true });
        }
    }
    typeNext();
  }

  function goToEndingScreen() {
    showScreen("ending");
    document.querySelectorAll("#ending-screen .fade-item").forEach((el) => {
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
    });
  }

  /* ---------------------------------------------------
     MUSIC TOGGLE
  --------------------------------------------------- */
  let musicPlaying = false;

  function handleMusicToggle() {
    if (!bgMusic) return;

    if (musicPlaying) {
      bgMusic.pause();
      musicPlaying = false;
      musicToggleBtn.classList.remove("playing");
    } else {
      bgMusic.muted = false;
      const playPromise = bgMusic.play();
      if (playPromise && playPromise.catch) {
        playPromise
          .then(() => {
            musicPlaying = true;
            musicToggleBtn.classList.add("playing");
          })
          .catch(() => {
            // Autoplay / missing file fallback — fail silently
            musicPlaying = false;
            musicToggleBtn.classList.remove("playing");
          });
      } else {
        musicPlaying = true;
        musicToggleBtn.classList.add("playing");
      }
    }
  }

  /* ---------------------------------------------------
     EVENT LISTENERS
  --------------------------------------------------- */
  passwordForm.addEventListener("submit", handlePasswordSubmit);
  passwordInput.addEventListener("animationend", () => {
    passwordInput.classList.remove("shake");
  });

  openLetterBtn.addEventListener("click", handleOpenLetterClick);
  envelopeEl.addEventListener("click", handleEnvelopeClick);
  musicToggleBtn.addEventListener("click", handleMusicToggle);

  window.addEventListener("resize", () => {
    resizeStarsCanvas();
    initStars();
    resizeFireworksCanvas();
  });

  /* ---------------------------------------------------
     INIT
  --------------------------------------------------- */
  function init() {
    initStars();
    requestAnimationFrame(drawStars);
    startParticleLoop();
    showScreen("password");
    passwordInput.focus({ preventScroll: true });
  }

  document.addEventListener("DOMContentLoaded", init);
})();

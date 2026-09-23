// Make every confetti burst draw above overlays (countdown, reveal, photo wall)
if (typeof window.confetti === "function") {
  const baseConfetti = window.confetti;
  window.confetti = (opts = {}) => baseConfetti({ zIndex: 10010, ...opts });
}

// Good things / Teasers for countdown
const goodThings = [
  "🤫 If you're reading this, you're too early. Classic Kiki.",
  "📸 Someone has been secretly collecting evidence of you eating. Just saying.",
  "☕ Chai is on me this week. Don't argue. (Okay fine, argue. You'll win anyway.)",
  "🏠 Reached home? Good. Now sit right here and wait.",
  "🎂 Loading birthday... 99%... please don't refresh 50 times.",
  "💌 There's a note hidden in here. I wrote it myself. No, really.",
  "🍟 This surprise has more layers than your fries order.",
  "🕛 Midnight is coming. So is your very dramatic surprise.",
];

const fallbackTeasers = [
  {
    emoji: "🙅‍♂️🔒",
    title: "Access Denied, Madam",
    message:
      'This vault only opens at midnight. Not 11:59. Not "just one small peek". Midnight. 🕛',
    button: "Fine, I'll wait 🙄",
  },
  {
    emoji: "🕵️‍♀️📋",
    title: "Suspicious Activity Detected",
    message:
      'Second attempt logged. I\'ve added it to your file, right next to "eats fries without sharing". 🍟',
    button: "It wasn't me 🙈",
  },
  {
    emoji: "😤☕",
    title: "Okay Fine, One Clue",
    message:
      "Scratch the card below. And no, you can't argue your way into a better hint. Arguing is my job. 😂👇",
    button: "Hmph. Okay 😤",
  },
  {
    emoji: "🥺🎁",
    title: "Kikiii, Stop It",
    message:
      "Real hint this time: keep your volume UP at midnight. And keep some snacks nearby. You'll know why. 🔊",
    button: "Snacks ready 🍿",
  },
  {
    emoji: "🏳️😂",
    title: "I Give Up, You Win",
    message:
      "You've tried so many times I'm actually impressed. Still not telling. Go pop the floating balloons and burn off some curiosity. 🎈",
    button: "You're so annoying 😂",
  },
];

const isPreviewMode = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has("preview") || urlParams.get("preview") === "true";
};

// Interactive Scratch-off Card Setup
let isScratchInitialized = false;
const setupScratchCard = (secretHintText) => {
  const canvas = document.getElementById("scratch-canvas");
  const secretTextEl = document.getElementById("scratch-secret-text");
  if (!canvas) return;

  if (secretHintText && secretTextEl) {
    secretTextEl.innerText = secretHintText;
  }

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  // Reset canvas composition
  ctx.globalCompositeOperation = "source-over";

  // Silver metallic gradient foil
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, "#d4d4d4");
  grad.addColorStop(0.3, "#f0f0f0");
  grad.addColorStop(0.5, "#b0b0b0");
  grad.addColorStop(0.8, "#e8e8e8");
  grad.addColorStop(1, "#a8a8a8");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Decorative sparkles & text on foil
  ctx.fillStyle = "#555555";
  ctx.font = "bold 13px 'Work Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("✨ Scratch Here with Finger/Mouse! ✨", width / 2, height / 2);

  let isDrawing = false;

  const scratch = (x, y) => {
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2, false);
    ctx.fill();
  };

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  // Attach event handlers if not already bound
  canvas.onmousedown = (e) => {
    isDrawing = true;
    const pos = getPos(e);
    scratch(pos.x, pos.y);
  };
  canvas.onmousemove = (e) => {
    if (isDrawing) {
      const pos = getPos(e);
      scratch(pos.x, pos.y);
    }
  };
  window.onmouseup = () => {
    isDrawing = false;
  };

  canvas.ontouchstart = (e) => {
    isDrawing = true;
    const pos = getPos(e);
    scratch(pos.x, pos.y);
  };
  canvas.ontouchmove = (e) => {
    if (isDrawing) {
      e.preventDefault();
      const pos = getPos(e);
      scratch(pos.x, pos.y);
    }
  };
  canvas.ontouchend = () => {
    isDrawing = false;
  };
};

// ---------- Countdown finale: final seconds + birthday reveal ----------
const toGraphemes = (text) => {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(seg.segment(text), (x) => x.segment);
  }
  return Array.from(text);
};

let finalCountEl = null;
const showFinalCount = (n) => {
  const screen = document.getElementById("countdown-screen");
  if (!screen || n < 1) return;
  if (!finalCountEl) {
    finalCountEl = document.createElement("div");
    finalCountEl.className = "final-count";
    screen.appendChild(finalCountEl);
    screen.classList.add("final-mode");
  }
  if (finalCountEl.dataset.n === String(n)) return;
  finalCountEl.dataset.n = String(n);
  finalCountEl.textContent = n;
  finalCountEl.classList.remove("tick");
  void finalCountEl.offsetWidth; // restart the pop animation
  finalCountEl.classList.add("tick");
  if (n <= 3 && typeof confetti === "function") {
    confetti({ particleCount: 25 * (4 - n), spread: 70, origin: { y: 0.65 } });
  }
};

const hideFinalCount = () => {
  if (finalCountEl) {
    finalCountEl.remove();
    finalCountEl = null;
  }
  const screen = document.getElementById("countdown-screen");
  if (screen) screen.classList.remove("final-mode");
};

let revealPlayed = false;
const playBirthdayReveal = (cfg = {}, onDone) => {
  if (revealPlayed) return;
  revealPlayed = true;

  const title = cfg.revealTitle || "It's Your Day, Kiki! 🎂";
  const sub = cfg.revealSubtitle || "The wait is finally over 🎉";
  const btnLabel = cfg.revealButton || "Open your surprise 🎁";
  const fire = (opts) => {
    if (typeof confetti === "function") confetti(opts);
  };
  const colors = [
    "#ff4081",
    "#ffd700",
    "#15a1ed",
    "#7c4dff",
    "#00e5b0",
    "#ffffff",
  ];

  const card = document.querySelector(".countdown-card");
  if (card) card.classList.add("card-explode");

  const ov = document.createElement("div");
  ov.className = "reveal-overlay";
  ov.innerHTML = `
    <div class="reveal-rays"></div>
    <div class="reveal-rain"></div>
    <div class="reveal-content">
      <div class="reveal-gift">🎁</div>
      <h1 class="reveal-title"></h1>
      <p class="reveal-sub"></p>
      <button class="reveal-btn"></button>
    </div>
    <div class="reveal-flash"></div>`;

  const titleEl = ov.querySelector(".reveal-title");
  toGraphemes(title).forEach((ch, i) => {
    const span = document.createElement("span");
    span.textContent = ch === " " ? " " : ch;
    span.style.setProperty("--i", i);
    titleEl.appendChild(span);
  });
  ov.querySelector(".reveal-sub").textContent = sub;
  const btn = ov.querySelector(".reveal-btn");
  btn.textContent = btnLabel;

  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add("show"));

  // Emoji rain
  const rain = ov.querySelector(".reveal-rain");
  const emojis = ["🎈", "🎂", "💖", "🎉", "✨", "🎁", "🥳", "💕", "🌸"];
  const rainTimer = setInterval(() => {
    const e = document.createElement("span");
    e.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    e.style.left = `${Math.random() * 96}%`;
    e.style.fontSize = `${18 + Math.random() * 26}px`;
    e.style.animationDuration = `${3 + Math.random() * 3}s`;
    rain.appendChild(e);
    setTimeout(() => e.remove(), 6500);
  }, 170);

  // Gift bursts open -> title + big confetti + fireworks
  let fireworks = null;
  setTimeout(() => {
    ov.classList.add("burst");
    fire({
      particleCount: 160,
      spread: 100,
      startVelocity: 45,
      origin: { y: 0.45 },
      colors,
    });
    setTimeout(() => {
      fire({
        particleCount: 70,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.8 },
        colors,
      });
      fire({
        particleCount: 70,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.8 },
        colors,
      });
    }, 250);
    fireworks = setInterval(() => {
      fire({
        particleCount: 45,
        spread: 360,
        startVelocity: 28,
        ticks: 70,
        gravity: 0.9,
        scalar: 0.9,
        origin: { x: 0.1 + Math.random() * 0.8, y: 0.1 + Math.random() * 0.35 },
        colors,
      });
    }, 650);
  }, 1400);

  btn.addEventListener("click", () => {
    // The tap counts as a user gesture, so the music is allowed to start
    const audio = document.getElementById("bday-audio");
    if (audio && audio.paused) audio.play().catch(() => {});

    fire({
      particleCount: 120,
      spread: 120,
      startVelocity: 50,
      origin: { y: 0.6 },
      colors,
    });
    clearInterval(rainTimer);
    if (fireworks) clearInterval(fireworks);
    ov.classList.add("leave");
    setTimeout(() => {
      ov.remove();
      if (onDone) onDone();
    }, 750);
  });
};

// Countdown & Interactive Excitement Controller
const initCountdown = (targetDateStr, customConfig = {}) => {
  const countdownScreen = document.getElementById("countdown-screen");
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const goodThingEl = document.getElementById("good-thing-text");
  const previewBtn = document.getElementById("preview-btn");
  const collectiblesContainer = document.getElementById(
    "floating-collectibles",
  );
  const countdownCard = document.querySelector(".countdown-card");

  if (isPreviewMode()) {
    if (countdownScreen) countdownScreen.classList.add("hidden");
    animationTimeline();
    return;
  }

  // Determine target date (25 Sept 00:00:00)
  let targetDate;
  if (targetDateStr) {
    targetDate = new Date(targetDateStr);
  } else {
    const now = new Date();
    targetDate = new Date(now.getFullYear(), 8, 25, 0, 0, 0); // 25 Sept 12:00 AM
  }

  // Test mode: add ?reveal to the URL to watch the last 12 seconds + reveal
  if (new URLSearchParams(window.location.search).has("reveal")) {
    targetDate = new Date(Date.now() + 12000);
  }

  const popTexts = [
    "🎉 Magic in the air! ✨",
    "💖 Birthday loading... ⏳",
    "🎈 Woohoo! 🥳",
    "✨ Almost time, Krishna! 🎂",
    "🤫 Secret surprise! 🎁",
    "🥳 Curiosity 100/100! 📈",
  ];
  let popIdx = 0;

  // Trigger Excitement Effects (Confetti + Floating Text + Card Bounce)
  const triggerExcitement = (clientX, clientY) => {
    // 1. Card Bounce Wiggle
    if (countdownCard) {
      countdownCard.classList.remove("card-bounce");
      // Force reflow
      void countdownCard.offsetWidth;
      countdownCard.classList.add("card-bounce");
    }

    // 2. Multi-Cannon Confetti Explosions
    if (typeof confetti === "function") {
      const originX = clientX ? clientX / window.innerWidth : 0.5;
      const originY = clientY ? clientY / window.innerHeight : 0.6;

      // Direct point explosion
      confetti({
        particleCount: 45,
        spread: 80,
        origin: { x: originX, y: originY },
        colors: ["#ff4081", "#15a1ed", "#ffd700", "#ff80ab", "#7c4dff"],
      });

      // Side Cannon Blast
      setTimeout(() => {
        confetti({
          particleCount: 30,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.75 },
        });
        confetti({
          particleCount: 30,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.75 },
        });
      }, 120);
    }

    // 3. Floating Pop Text Badge
    const popInd = document.createElement("div");
    popInd.className = "pop-indicator";
    popInd.innerText = popTexts[popIdx % popTexts.length];
    popIdx++;

    const posX = clientX ? clientX - 60 : window.innerWidth / 2 - 60;
    const posY = clientY ? clientY - 30 : window.innerHeight / 2 - 30;

    popInd.style.left = `${posX}px`;
    popInd.style.top = `${posY}px`;
    document.body.appendChild(popInd);
    setTimeout(() => popInd.remove(), 850);
  };

  // Twinkling stars for the night sky
  const sky = document.getElementById("night-sky");
  if (sky && !sky.dataset.stars) {
    for (let i = 0; i < 70; i++) {
      const st = document.createElement("span");
      st.className = "star";
      const size = Math.random() < 0.15 ? 3 : Math.random() < 0.5 ? 2 : 1.3;
      st.style.width = st.style.height = `${size}px`;
      st.style.left = `${Math.random() * 100}%`;
      st.style.top = `${Math.random() * 100}%`;
      st.style.animationDelay = `${(Math.random() * 4).toFixed(2)}s`;
      st.style.animationDuration = `${(2 + Math.random() * 3).toFixed(2)}s`;
      sky.appendChild(st);
    }
    sky.dataset.stars = "1";
  }

  // Spawn Floating Collectible Emojis
  if (collectiblesContainer) {
    collectiblesContainer.innerHTML = "";
    const emojis = ["🎈", "🎁", "✨", "🎂", "💖", "⭐", "🎉", "🍬"];
    const numItems = 9;

    for (let i = 0; i < numItems; i++) {
      const item = document.createElement("div");
      item.className = "floating-item";
      item.innerText = emojis[i % emojis.length];

      const leftPos = Math.floor(Math.random() * 85) + 5;
      const animDuration = Math.floor(Math.random() * 4) + 7; // 7s to 11s
      const animDelay = (Math.random() * 5).toFixed(1);

      item.style.left = `${leftPos}%`;
      item.style.animationDuration = `${animDuration}s`;
      item.style.animationDelay = `${animDelay}s`;

      // Tap / Click Handler
      item.addEventListener("click", (e) => {
        triggerExcitement(e.clientX, e.clientY);

        // Pop item effect & respawn
        item.style.transform = "scale(1.5) rotate(20deg)";
        item.style.opacity = "0";
        setTimeout(() => {
          item.style.left = `${Math.floor(Math.random() * 85) + 5}%`;
          item.style.opacity = "1";
          item.style.transform = "none";
        }, 400);
      });

      collectiblesContainer.appendChild(item);
    }
  }

  // Rotating good things quote
  let goodThingIndex = 0;
  setInterval(() => {
    if (goodThingEl) {
      goodThingEl.style.opacity = "0";
      setTimeout(() => {
        goodThingIndex = (goodThingIndex + 1) % goodThings.length;
        goodThingEl.innerText = goodThings[goodThingIndex];
        goodThingEl.style.opacity = "1";
      }, 500);
    }
  }, 4500);

  // Typewriter title that changes as midnight gets closer
  const titleTextEl = document.getElementById("countdown-title-text");
  const pickList = (key, fallback) =>
    Array.isArray(customConfig[key]) && customConfig[key].length
      ? customConfig[key]
      : fallback;
  const titleSets = {
    normal: pickList("countdownTitles", [
      "Something Special is Cooking... ",
      "Shh... Birthday Loading 🤫",
      "The Surprise is in the Oven 🔥",
      "Patience, Birthday Girl 🎂",
      "Kiki's Big Day is Almost Here ✨",
      "Midnight Can't Come Soon Enough 🌙",
    ]),
    hour: pickList("countdownTitlesLastHour", [
      "Less Than an Hour, Kiki! ⏰",
      "Almost Midnight... 🌙",
      "Get Your Smile Ready 😁",
    ]),
    minute: pickList("countdownTitlesLastMinute", [
      "Get Ready, Kiki... 🎉",
      "Here It Comes! 🥳",
    ]),
  };
  const currentTitleSet = () => {
    const left = targetDate.getTime() - Date.now();
    if (left <= 60 * 1000) return titleSets.minute;
    if (left <= 60 * 60 * 1000) return titleSets.hour;
    return titleSets.normal;
  };
  const graphemes = (text) =>
    typeof Intl !== "undefined" && Intl.Segmenter
      ? Array.from(
          new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(
            text,
          ),
          (x) => x.segment,
        )
      : Array.from(text);

  if (titleTextEl) {
    let titleIdx = 0;
    let lastSet = null;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const typeTitle = async () => {
      while (document.body.contains(titleTextEl)) {
        const set = currentTitleSet();
        if (set !== lastSet) {
          lastSet = set;
          titleIdx = 0;
        }
        const chars = graphemes(set[titleIdx % set.length]);
        // type in
        for (let i = 1; i <= chars.length; i++) {
          titleTextEl.textContent = chars.slice(0, i).join("");
          await wait(55 + Math.random() * 45);
        }
        await wait(3200);
        // delete
        for (let i = chars.length - 1; i >= 0; i--) {
          titleTextEl.textContent = chars.slice(0, i).join("");
          await wait(28);
        }
        await wait(350);
        titleIdx++;
      }
    };
    // Show the first title fully, then start rotating
    titleTextEl.textContent = titleSets.normal[0];
    setTimeout(async () => {
      const chars = graphemes(titleTextEl.textContent);
      for (let i = chars.length - 1; i >= 0; i--) {
        titleTextEl.textContent = chars.slice(0, i).join("");
        await wait(28);
      }
      titleIdx = currentTitleSet() === titleSets.normal ? 1 : 0;
      lastSet = currentTitleSet();
      typeTitle();
    }, 3500);
  }

  // Countdown Timer Loop
  const updateTimer = () => {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance <= 0) {
      hideFinalCount();
      playBirthdayReveal(customConfig, () => {
        if (countdownScreen) countdownScreen.classList.add("hidden");
        animationTimeline();
      });
      return false;
    }

    // Dramatic final 10-second countdown
    if (distance <= 10500) showFinalCount(Math.ceil(distance / 1000));

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Update a digit tile with a little flip animation when it changes
    const setNum = (el, val) => {
      if (!el) return;
      const txt = String(val).padStart(2, "0");
      if (el.innerText === txt) return;
      el.innerText = txt;
      el.classList.remove("flip");
      void el.offsetWidth;
      el.classList.add("flip");
    };
    setNum(daysEl, days);
    setNum(hoursEl, hours);
    setNum(minutesEl, minutes);
    setNum(secondsEl, seconds);

    // "Birthday loading..." bar fills up over the final 7 days
    const windowMs = 7 * 24 * 60 * 60 * 1000;
    const pct = Math.max(1, Math.min(99.9, (1 - distance / windowMs) * 100));
    const fillEl = document.getElementById("bday-progress-fill");
    const pctEl = document.getElementById("bday-progress-pct");
    if (fillEl) fillEl.style.width = `${pct}%`;
    if (pctEl)
      pctEl.innerText = `${pct >= 99 ? pct.toFixed(1) : Math.floor(pct)}%`;

    return true;
  };

  const isPending = updateTimer();
  if (!isPending) return;

  const timerInterval = setInterval(() => {
    const active = updateTimer();
    if (!active) clearInterval(timerInterval);
  }, 250);

  // Dynamic Teaser / Mystery Vault Modal Trigger
  const teaserResponses = customConfig.teaserResponses || fallbackTeasers;
  // A different hint every time she scratches (3rd tap onwards)
  const scratchCardHints =
    Array.isArray(customConfig.scratchCardHints) &&
    customConfig.scratchCardHints.length
      ? customConfig.scratchCardHints
      : [
          "🔍 Hint: there's evidence. A LOT of evidence. Mostly of you eating. 📸🍕",
          "💌 Hint: someone actually wrote you something. Himself. No copy-paste. Mostly.",
          "🍌 Hint: a certain pair of yellow t-shirts is making a comeback.",
          "🔊 Hint: volume UP at midnight. There's a song, and no, I'm not singing it.",
          "🎈 Hint: balloons. Big ones. Some of them are heart-shaped. That's all you get.",
        ];
  let previewAttempts = parseInt(
    sessionStorage.getItem("kiki_preview_attempts_v2") || "0",
    10,
  );

  if (previewBtn) {
    previewBtn.addEventListener("click", (e) => {
      triggerExcitement(e.clientX, e.clientY);

      previewAttempts++;
      sessionStorage.setItem("kiki_preview_attempts_v2", previewAttempts);

      const kikiModal = document.getElementById("kiki-modal");
      const emojiEl = document.getElementById("kiki-emoji");
      const titleEl = document.getElementById("kiki-modal-title");
      const descEl = document.getElementById("kiki-modal-desc");
      const scratchWrapper = document.getElementById("scratch-card-wrapper");

      // Pick response based on attempt count
      const responseIdx = Math.min(
        previewAttempts - 1,
        teaserResponses.length - 1,
      );
      const currentTeaser = teaserResponses[responseIdx];

      if (emojiEl) emojiEl.innerText = currentTeaser.emoji;
      if (titleEl) titleEl.innerText = currentTeaser.title;
      if (descEl) descEl.innerText = currentTeaser.message;

      // Close button text changes every time too
      const closeBtnEl = document.getElementById("close-kiki-modal");
      if (closeBtnEl) {
        const extraBtns =
          Array.isArray(customConfig.teaserExtraButtons) &&
          customConfig.teaserExtraButtons.length
            ? customConfig.teaserExtraButtons
            : [
                "Just one more try... 👀",
                "I'm not giving up 😤",
                "Okay okay, I surrender 🏳️",
              ];
        closeBtnEl.innerText =
          previewAttempts > teaserResponses.length
            ? extraBtns[
                (previewAttempts - teaserResponses.length - 1) %
                  extraBtns.length
              ]
            : currentTeaser.button || "Okay fine! 🙈";
      }

      // Show Scratch Card on attempt 3 and onwards
      if (previewAttempts >= 3 && scratchWrapper) {
        scratchWrapper.classList.remove("hidden");
        const hintIdx = (previewAttempts - 3) % scratchCardHints.length;
        setupScratchCard(scratchCardHints[hintIdx]);
      } else if (scratchWrapper) {
        scratchWrapper.classList.add("hidden");
      }

      if (kikiModal) {
        kikiModal.classList.remove("hidden");
      }
    });
  }

  // Modal Close buttons
  const closeKikiBtn = document.getElementById("close-kiki-modal");
  const closeKikiXBtn = document.getElementById("modal-close-x");
  const hideModal = () => {
    const kikiModal = document.getElementById("kiki-modal");
    if (kikiModal) {
      kikiModal.classList.add("hidden");
    }
  };

  if (closeKikiBtn) closeKikiBtn.addEventListener("click", hideModal);
  if (closeKikiXBtn) closeKikiXBtn.addEventListener("click", hideModal);
};

const defaultData = {
  greeting: "Hey",
  name: "Krishna (Kikiiii) ✨💖",
  greetingText: "I absolutely adore you and your sweet smile! 🥰",
  wishText:
    "May your day be filled with endless smiles, pure magic, warm hugs, and all the love in the universe. You bring so much joy and light into my life every single day! Happy Birthday, beautiful! ❤️✨🎉",
  imagePath: "img/kiki.png",
  image2Path: "img/Bday K.png",
  text1: "It's your special birthday, my favorite human! 🎂💖",
  textInChatBox:
    "Happy Birthday to the most amazing, gorgeous & adorable girl ever!! 🥳💕✨",
  sendButtonLabel: "Send Love 💌",
  text2: "That was going to be a basic wish...",
  text3: "But then I stopped and smiled.",
  text4: "Because a basic wish is never enough for someone as",
  text4Adjective: "extraordinary",
  text5Entry: "as you,",
  text5Content: "You are Truly Special",
  smiley: "🥰💖",
  bigTextPart1: "S",
  bigTextPart2: "O",
  wishHeading: "Happy Birthday, Kiki! 🎂✨",
  outroText:
    "Now come back, give me a big smile, and tell me if it made your heart skip a beat! 😉💖",
  replayText: "Or click here if you want to relive the magic again! ✨🎈",
  outroSmiley: "🥰✨",
  targetDate: "2026-09-25T00:00:00",
  revealTitle: "It's Your Day, Kiki! 🎂",
  revealSubtitle: "The wait is finally over 🎉",
  revealButton: "Open your surprise 🎁",
  loveLetterTitle: "A Secret Birthday Note For You 💌✨",
  loveLetterBody:
    "Kiki,\n\nOkay, I wrote and deleted this about five times, so just read it and don't judge me 😅\n\nHappy birthday ❤️ I don't really say this stuff out loud, so I'm putting it here where you can't interrupt me or laugh at me.\n\nYou have this laugh and voice that somehow make it impossible to stay annoyed at you, even when I'm trying really hard to. And somehow, you're always the first person I want to tell things to, whether they're important, completely stupid, or somewhere in between.\n\nI still love those simple moments with you, like going to Palladium Mall just for tea. I don't know why, but those little moments always end up being my favorite memories.\n\nThanks for putting up with my habit of arguing even when I know you're right 😂, and for all those little things you do, like asking me if I reached home, remembering my little preferences, and remembering the random things I tell you. You probably don't even notice you do it, but I do.\n\nI hope this year is really kind to you. You deserve all the happiness. ❤️\n\nNow go eat cake. And yes, I'm expecting my share 🎂\n\nHappy birthday, Kiki. ❤️\n\nYours - Jerry ;)",
  musicUrl: "music/happy-birthday.mp3",
  polaroidCaption1: "Your cute smile 🥰",
  polaroidCaption2: "Birthday Queen 👑",
  teaserResponses: fallbackTeasers,
  scratchCardHint:
    "🔍 Hint: there's evidence. A LOT of evidence. Mostly of you eating. 📸🍕",
  photoWall: {
    title: "The Evidence Wall 🕵️‍♀️📸",
    subtitle:
      "12 exhibits of pure silliness (and a LOT of food). Tap a photo to flip it 👆",
    photos: [
      {
        src: "img/wall/1.jpg",
        caption: "Minion squad, reporting for duty 💛",
        quote:
          "We walked in as humans and walked out as minions. Matching tees, zero shame. Bello! 🍌💛",
        focus: "38%",
        label: "Exhibit A",
      },
      {
        src: "img/wall/6.jpg",
        caption: "Tea for everyone. Mostly for her ☕",
        quote:
          "Chai in one hand, phone in the other, smile on full power. Peak Kiki mode unlocked. 📱☕",
        focus: "28%",
        label: "Exhibit B",
      },
      {
        src: "img/wall/7.jpg",
        caption: "Pizza's here. Her attention isn't 🍕",
        quote:
          "A whole Margherita right in front of her and she's staring somewhere else like she's plotting an escape. Suspicious. 🕵️‍♀️",
        focus: "32%",
        label: "Exhibit C",
      },
      {
        src: "img/wall/2.jpg",
        caption: "Dinner date, certified ☕",
        quote:
          "Rare footage of both of us behaving like normal people. Screenshot it, it won't happen again. 📸",
        focus: "38%",
        label: "Exhibit D",
      },
      {
        src: "img/wall/3.jpg",
        caption: "3 seconds later... 😛",
        quote:
          'Me: "let\'s take a decent photo." Also me: 😛  You, as usual, being the only mature one here. 🙄',
        focus: "38%",
        label: "Exhibit E",
      },
      {
        src: "img/wall/9.jpg",
        caption: "Spoon ready. Attack mode ON 🥄",
        quote:
          'Caught mid-strategy: "how do I finish this without sharing any?" The spoon was the weapon. 🥄😤',
        focus: "28%",
        label: "Exhibit F",
      },
      {
        src: "img/wall/10.jpg",
        caption: "Do not disturb. She's eating 🤫",
        quote:
          "Eyes closed. Full focus. Chai AND a sandwich. This is a sacred moment, please do not interrupt. 🥪🙏",
        focus: "28%",
        label: "Exhibit G",
      },
      {
        src: "img/wall/11.jpg",
        caption: "Fries > everything 🍟",
        quote:
          "Guarding the fries like a national treasure. Asking for even one = very risky move. 🍟🛡️",
        focus: "30%",
        label: "Exhibit H",
      },
      {
        src: "img/wall/4.jpg",
        caption: "Main character energy 💅",
        quote:
          "Heart filter ✅ Glasses ✅ Tongue out ✅ Looking like you're about to judge my entire life ✅ 😂",
        focus: "38%",
        label: "Exhibit I",
      },
      {
        src: "img/wall/12.jpg",
        caption: "Ice cream + phone = multitasking queen 🍦",
        quote:
          "Replying to texts AND finishing the ice cream before it melts. Pro level. Nobody else can do this. 🍦📱",
        focus: "40%",
        label: "Exhibit J",
      },
      {
        src: "img/wall/5.jpg",
        caption: "Black & white, Steal hearts 🤍",
        quote:
          'Filter: dramatic. Mood: "I need this filter coffee more than I need anyone." Honestly, relatable. ☕🖤',
        focus: "40%",
        label: "Exhibit K",
      },
      {
        src: "img/wall/8.jpg",
        caption: "This smile. That's the caption 😊",
        quote:
          "Out of all the silly ones, this is the one I'd frame. Don't let it go to your head. 😌💖",
        focus: "40%",
        label: "Exhibit L",
      },
    ],
  },
};

// ---------- Photo Wall ("Evidence Wall") ----------
let photoWallOnClose = null;

const buildPhotoWall = (wallData) => {
  const grid = document.getElementById("wall-grid");
  const lights = document.getElementById("wall-lights");
  if (!grid || !wallData || !Array.isArray(wallData.photos)) return;

  const titleEl = document.getElementById("wall-title");
  const subEl = document.getElementById("wall-sub");
  if (titleEl && wallData.title) titleEl.innerText = wallData.title;
  if (subEl && wallData.subtitle) subEl.innerText = wallData.subtitle;

  const tilts = [-6, 4, -3, 6, -5, 3];
  const tapes = [
    "#ffd1e3",
    "#c9f2ff",
    "#fff3a6",
    "#d9ccff",
    "#c8ffe4",
    "#ffd9b8",
  ];
  grid.innerHTML = "";
  wallData.photos.forEach((ph, i) => {
    const card = document.createElement("div");
    card.className = "wall-card";
    card.style.setProperty("--tilt", `${tilts[i % tilts.length]}deg`);
    card.style.setProperty("--delay", `${0.15 + i * 0.13}s`);
    card.style.setProperty("--tape", tapes[i % tapes.length]);
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.innerHTML = `
            <span class="wall-tape"></span>
            <div class="wall-card-inner">
                <div class="wall-card-front">
                    <div class="wall-photo"><img alt="" loading="lazy"></div>
                    <p class="wall-caption"></p>
                </div>
                <div class="wall-card-back">
                    <span class="wall-label"></span>
                    <p class="wall-quote"></p>
                    <span class="wall-flip-hint">tap to flip back ↺</span>
                </div>
            </div>`;
    card.querySelector("img").src = ph.src;
    if (ph.focus)
      card.querySelector("img").style.objectPosition = `center ${ph.focus}`;
    card.querySelector(".wall-caption").innerText = ph.caption || "";
    card.querySelector(".wall-quote").innerText = ph.quote || "";
    card.querySelector(".wall-label").innerText =
      ph.label || `Exhibit ${String.fromCharCode(65 + i)}`;

    const flip = () => {
      card.classList.toggle("flipped");
      if (
        card.classList.contains("flipped") &&
        typeof confetti === "function"
      ) {
        const r = card.getBoundingClientRect();
        confetti({
          particleCount: 25,
          spread: 55,
          startVelocity: 25,
          origin: {
            x: (r.left + r.width / 2) / window.innerWidth,
            y: (r.top + r.height / 3) / window.innerHeight,
          },
          colors: ["#ff4081", "#ffd700", "#7c4dff", "#15a1ed"],
        });
      }
    };
    card.addEventListener("click", flip);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        flip();
      }
    });
    grid.appendChild(card);
  });

  if (lights && !lights.childElementCount) {
    const colors = ["#ff4081", "#ffd700", "#15a1ed", "#7c4dff", "#00c9a7"];
    for (let i = 0; i < 16; i++) {
      const b = document.createElement("span");
      b.style.setProperty("--c", colors[i % colors.length]);
      b.style.animationDelay = `${(i % 4) * 0.35}s`;
      lights.appendChild(b);
    }
  }
};

const openPhotoWall = (duringShow, onClose) => {
  const wall = document.getElementById("photo-wall");
  const btn = document.getElementById("wall-close-btn");
  if (!wall) {
    if (onClose) onClose();
    return;
  }
  photoWallOnClose = onClose || null;
  if (btn)
    btn.innerText = duringShow
      ? "Continue the surprise ✨"
      : "Close the wall 💖";
  wall
    .querySelectorAll(".wall-card")
    .forEach((c) => c.classList.remove("flipped"));
  wall.scrollTop = 0;
  wall.classList.remove("open");
  void wall.offsetWidth; // restart drop-in animation
  wall.classList.add("open");
  wall.setAttribute("aria-hidden", "false");
  if (typeof confetti === "function") {
    setTimeout(
      () => confetti({ particleCount: 60, spread: 90, origin: { y: 0.3 } }),
      700,
    );
  }
};

const closePhotoWall = () => {
  const wall = document.getElementById("photo-wall");
  if (wall) {
    wall.classList.remove("open");
    wall.setAttribute("aria-hidden", "true");
  }
  const cb = photoWallOnClose;
  photoWallOnClose = null;
  if (cb) cb();
};

const setupInteractiveFeatures = (data = {}) => {
  buildPhotoWall(data.photoWall || defaultData.photoWall);
  const wallCloseBtn = document.getElementById("wall-close-btn");
  if (wallCloseBtn) wallCloseBtn.addEventListener("click", closePhotoWall);
  const openWallBtn = document.getElementById("open-wall-btn");
  if (openWallBtn)
    openWallBtn.addEventListener("click", () => openPhotoWall(false));
  // 1. Music Player Widget Setup
  const musicBtn = document.getElementById("music-btn");
  const musicText = document.getElementById("music-text");
  const audioEl = document.getElementById("bday-audio");

  const LOCAL_MUSIC = "music/happy-birthday.mp3";
  if (audioEl) {
    audioEl.src = data.musicUrl || LOCAL_MUSIC;
    audioEl.preload = "auto";
    // If a custom/online track fails to load, fall back to the bundled file
    audioEl.addEventListener("error", () => {
      if (!audioEl.src.endsWith(LOCAL_MUSIC)) {
        audioEl.src = LOCAL_MUSIC;
      }
    });
  }

  const setPlayingUI = (playing) => {
    if (!musicBtn) return;
    musicBtn.classList.toggle("playing", playing);
    if (musicText) musicText.innerText = playing ? "Pause Music" : "Play Music";
  };

  if (musicBtn && audioEl) {
    musicBtn.addEventListener("click", () => {
      if (audioEl.paused) {
        audioEl
          .play()
          .then(() => setPlayingUI(true))
          .catch((err) => {
            console.warn(
              "Music could not play, retrying with local file:",
              err,
            );
            audioEl.src = LOCAL_MUSIC;
            audioEl.load();
            audioEl
              .play()
              .then(() => setPlayingUI(true))
              .catch(() => setPlayingUI(false));
          });
      } else {
        audioEl.pause();
        setPlayingUI(false);
      }
    });
    audioEl.addEventListener("pause", () => setPlayingUI(false));
    audioEl.addEventListener("play", () => setPlayingUI(true));
  }

  // 2. Love Letter Modal Handlers
  const openLetterBtn = document.getElementById("open-letter-btn");
  const closeLetterBtn = document.getElementById("close-letter-btn");
  const closeLetterXBtn = document.getElementById("close-letter-modal-x");
  const loveLetterModal = document.getElementById("love-letter-modal");
  const letterTitle = document.getElementById("love-letter-title");
  const letterBody = document.getElementById("love-letter-body");

  if (data.loveLetterTitle && letterTitle) {
    letterTitle.innerText = data.loveLetterTitle;
  }
  if (data.loveLetterBody && letterBody) {
    letterBody.innerHTML = data.loveLetterBody.replace(/\n/g, "<br>");
  }

  const openLetter = () => {
    if (loveLetterModal) loveLetterModal.classList.remove("hidden");
    if (typeof confetti === "function") {
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };
  const closeLetter = () => {
    if (loveLetterModal) loveLetterModal.classList.add("hidden");
  };

  if (openLetterBtn) openLetterBtn.addEventListener("click", openLetter);
  if (closeLetterBtn) closeLetterBtn.addEventListener("click", closeLetter);
  if (closeLetterXBtn) closeLetterXBtn.addEventListener("click", closeLetter);

  // 3. Virtual Hugs & Kisses Button Handler
  const hugBtn = document.getElementById("hug-btn");
  if (hugBtn) {
    hugBtn.addEventListener("click", (e) => {
      // Heart & Kiss confetti burst
      if (typeof confetti === "function") {
        confetti({
          particleCount: 60,
          spread: 90,
          origin: {
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight,
          },
          colors: ["#ff4081", "#ff80ab", "#d81b60", "#ff1744"],
        });
      }

      // Floating Hugs Pop Indicators
      const hugEmojis = [
        "💖 Hugs!",
        "💋 Kisses!",
        "🥰 Love you!",
        "💕 Muah!",
        "💓 Hugs!",
      ];
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const popInd = document.createElement("div");
          popInd.className = "pop-indicator";
          popInd.innerText =
            hugEmojis[Math.floor(Math.random() * hugEmojis.length)];
          const posX = Math.random() * (window.innerWidth - 100) + 20;
          const posY = Math.random() * (window.innerHeight - 200) + 100;
          popInd.style.left = `${posX}px`;
          popInd.style.top = `${posY}px`;
          document.body.appendChild(popInd);
          setTimeout(() => popInd.remove(), 850);
        }, i * 150);
      }
    });
  }
};

const applyData = (data) => {
  const dataArr = Object.keys(data);
  dataArr.forEach((customData) => {
    if (data[customData] !== "" && typeof data[customData] === "string") {
      const el = document.querySelector(`[data-node-name*="${customData}"]`);
      if (el) {
        if (customData === "imagePath" || customData === "image2Path") {
          el.setAttribute("src", data[customData]);
        } else {
          el.innerText = data[customData];
        }
      }
    }
  });

  setupInteractiveFeatures(data);
  initCountdown(data.targetDate, data);
};

// Import the data to customize and insert them into page
const fetchData = () => {
  fetch("customize.json", { cache: "no-store" })
    .then((res) => res.json())
    .then((data) => applyData(data))
    .catch((err) => {
      console.info(
        "Notice: Local file protocol fallback used for customize.json",
      );
      applyData(defaultData);
    });
};

// Glossy, colourful balloons (replaces the old small SVG images)
const BALLOON_COLORS = [
  ["#ff3d7f", "#ffb3cf"],
  ["#ff1744", "#ff9e9e"],
  ["#7c4dff", "#c9b8ff"],
  ["#ffb300", "#fff1a8"],
  ["#1eaaf1", "#b3ecff"],
  ["#ff6fb5", "#ffe0f0"],
  ["#00bfa5", "#b2fff0"],
  ["#e040fb", "#f6c2ff"],
];

const balloonSVG = (dark, light, isHeart, id) => {
  const body = isHeart
    ? "M50 112 C20 90 4 70 4 44 C4 22 19 8 35 8 C44 8 50 15 50 23 C50 15 56 8 65 8 C81 8 96 22 96 44 C96 70 80 90 50 112Z"
    : "M50 4 C77 4 94 26 94 54 C94 86 70 108 54 114 L50 116 L46 114 C30 108 6 86 6 54 C6 26 23 4 50 4Z";
  const knotY = isHeart ? 112 : 115;
  return `<svg viewBox="0 0 100 175" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="bg${id}" cx="35%" cy="28%" r="75%">
                <stop offset="0%" stop-color="${light}"/>
                <stop offset="55%" stop-color="${dark}"/>
                <stop offset="100%" stop-color="${dark}" stop-opacity="0.95"/>
            </radialGradient>
        </defs>
        <path d="M50 ${knotY + 6} C43 134 57 146 50 158 C45 166 53 170 50 175" fill="none" stroke="rgba(90,90,110,0.45)" stroke-width="1.4"/>
        <path d="${body}" fill="url(#bg${id})"/>
        <path d="M44 ${knotY + 7} L50 ${knotY - 2} L56 ${knotY + 7} Z" fill="${dark}"/>
        <ellipse cx="33" cy="${isHeart ? 30 : 33}" rx="8" ry="15" transform="rotate(-28 33 33)" fill="#fff" opacity="0.55"/>
        <ellipse cx="27" cy="${isHeart ? 50 : 55}" rx="2.6" ry="4" fill="#fff" opacity="0.45"/>
    </svg>`;
};

const buildBalloons = () => {
  const holder = document.querySelector(".baloons");
  if (!holder || holder.dataset.built === "yes") return;
  holder.innerHTML = "";
  const count = 24;
  for (let i = 0; i < count; i++) {
    const [dark, light] = BALLOON_COLORS[i % BALLOON_COLORS.length];
    const el = document.createElement("div");
    el.className = "balloon";
    el.innerHTML = balloonSVG(dark, light, i % 5 === 2, i);
    const sizeVw = 24 + Math.random() * 16; // 24vw - 40vw
    el.style.width = `clamp(90px, ${sizeVw.toFixed(1)}vw, 200px)`;
    const slot = (i * 37) % 100; // spread evenly-ish
    el.style.left = `${Math.min(88, Math.max(-6, slot - 8 + Math.random() * 10))}%`;
    el.style.zIndex = String(Math.round(sizeVw)); // bigger ones in front
    holder.appendChild(el);
  }
  holder.dataset.built = "yes";
};

// Animation Timeline
const animationTimeline = () => {
  // Show the music button only once the birthday show starts
  const musicWidget = document.getElementById("music-player-widget");
  if (musicWidget) musicWidget.classList.remove("is-hidden");

  buildBalloons();
  // Split chars that need to be animated individually.
  // Uses grapheme segmentation so emojis (🎂, ❤️, 🕵️‍♀️ ...) stay whole
  // instead of being cut into broken "?" halves.
  const splitGraphemes = (text) => {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
      return Array.from(seg.segment(text), (s) => s.segment);
    }
    // Fallback: keeps surrogate pairs + ZWJ / variation-selector sequences together
    return (
      text.match(
        /(?:\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})?)*)|[\s\S]/gu,
      ) || []
    );
  };

  const splitIntoSpans = (el) => {
    if (!el || el.dataset.split === "done") return;
    const text = el.textContent;
    el.textContent = "";
    splitGraphemes(text).forEach((ch) => {
      const span = document.createElement("span");
      span.textContent = ch === " " ? "\u00A0" : ch;
      el.appendChild(span);
    });
    el.dataset.split = "done";
  };

  splitIntoSpans(document.getElementsByClassName("hbd-chatbox")[0]);
  splitIntoSpans(document.getElementsByClassName("wish-hbd")[0]);

  const ideaTextTrans = {
    opacity: 0,
    y: -20,
    rotationX: 5,
    skewX: "15deg",
  };

  const ideaTextTransLeave = {
    opacity: 0,
    y: 20,
    rotationY: 5,
    skewX: "-15deg",
  };

  const tl = new TimelineMax();

  tl.to(".container", 0.1, {
    visibility: "visible",
  })
    .from(".one", 0.7, {
      opacity: 0,
      y: 10,
    })
    .from(".two", 0.4, {
      opacity: 0,
      y: 10,
    })
    .to(
      ".one",
      0.7,
      {
        opacity: 0,
        y: 10,
      },
      "+=2.5",
    )
    .to(
      ".two",
      0.7,
      {
        opacity: 0,
        y: 10,
      },
      "-=1",
    )
    .from(".three", 0.7, {
      opacity: 0,
      y: 10,
      // scale: 0.7
    })
    .to(
      ".three",
      0.7,
      {
        opacity: 0,
        y: 10,
      },
      "+=2",
    )
    .from(".four", 0.7, {
      scale: 0.2,
      opacity: 0,
    })
    .from(".fake-btn", 0.3, {
      scale: 0.2,
      opacity: 0,
    })
    .staggerTo(
      ".hbd-chatbox span",
      0.5,
      {
        visibility: "visible",
      },
      0.05,
    )
    .to(".fake-btn", 0.1, {
      backgroundColor: "rgb(127, 206, 248)",
    })
    .to(
      ".four",
      0.5,
      {
        scale: 0.2,
        opacity: 0,
        y: -150,
      },
      "+=0.7",
    )
    .from(".idea-1", 0.7, ideaTextTrans)
    .to(".idea-1", 0.7, ideaTextTransLeave, "+=1.5")
    .from(".idea-2", 0.7, ideaTextTrans)
    .to(".idea-2", 0.7, ideaTextTransLeave, "+=1.5")
    .from(".idea-3", 0.7, ideaTextTrans)
    .to(".idea-3 strong", 0.5, {
      scale: 1.2,
      x: 10,
      backgroundColor: "rgb(21, 161, 237)",
      color: "#fff",
    })
    .to(".idea-3", 0.7, ideaTextTransLeave, "+=1.5")
    .from(".idea-4", 0.7, ideaTextTrans)
    .to(".idea-4", 0.7, ideaTextTransLeave, "+=1.5")
    .from(
      ".idea-5",
      0.7,
      {
        rotationX: 15,
        rotationZ: -10,
        skewY: "-5deg",
        y: 50,
        z: 10,
        opacity: 0,
      },
      "+=0.5",
    )
    .to(
      ".idea-5 .smiley",
      0.7,
      {
        rotation: 180,
        x: 8,
      },
      "+=0.4",
    )
    .to(
      ".idea-5",
      0.7,
      {
        scale: 0.2,
        opacity: 0,
      },
      "+=2",
    )
    .staggerFrom(
      ".idea-6 span",
      0.8,
      {
        scale: 3,
        opacity: 0,
        rotation: 15,
        ease: Expo.easeOut,
      },
      0.2,
    )
    .staggerTo(
      ".idea-6 span",
      0.8,
      {
        scale: 3,
        opacity: 0,
        rotation: -15,
        ease: Expo.easeOut,
      },
      0.2,
      "+=1",
    )
    .staggerFromTo(
      ".baloons .balloon",
      3.2,
      {
        opacity: 0.95,
        y: window.innerHeight + 60,
        rotation: 0,
      },
      {
        opacity: 1,
        y: -520,
        cycle: {
          x: (i) => (i % 2 ? 1 : -1) * (30 + Math.random() * 60),
          rotation: (i) => (i % 2 ? 1 : -1) * (6 + Math.random() * 10),
        },
        ease: Sine.easeInOut,
      },
      0.14,
    )
    .from(
      ".weegen-dp",
      0.5,
      {
        scale: 3.5,
        opacity: 0,
        x: 25,
        y: -25,
        rotationZ: -45,
      },
      "-=2",
    )
    .from(".hat", 0.5, {
      x: -100,
      y: 350,
      rotation: -180,
      opacity: 0,
    })
    .staggerFrom(
      ".wish-hbd span",
      0.7,
      {
        opacity: 0,
        y: -50,
        // scale: 0.3,
        rotation: 150,
        skewX: "30deg",
        ease: Elastic.easeOut.config(1, 0.5),
      },
      0.1,
    )
    .staggerFromTo(
      ".wish-hbd span",
      0.7,
      {
        scale: 1.4,
        rotationY: 150,
      },
      {
        scale: 1,
        rotationY: 0,
        color: "#ff69b4",
        ease: Expo.easeOut,
      },
      0.1,
      "party",
    )
    .call(() => {
      if (typeof confetti === "function") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 400);
      }
    })
    .from(
      ".wish h5",
      0.5,
      {
        opacity: 0,
        y: 10,
        skewX: "-15deg",
      },
      "party",
    )
    .staggerTo(
      ".eight svg",
      1.5,
      {
        visibility: "visible",
        opacity: 0,
        scale: 80,
        repeat: 3,
        repeatDelay: 1.4,
      },
      0.3,
    )
    .to(".six", 0.5, {
      opacity: 0,
      y: 30,
      zIndex: "-1",
    })
    .call(() => {
      // Pause the show and let her enjoy the photo wall
      tl.pause();
      openPhotoWall(true, () => tl.resume());
    })
    .staggerFrom(".nine p", 1, ideaTextTrans, 1.2)
    .to(
      ".last-smile",
      0.5,
      {
        rotation: 180,
      },
      "+=1",
    )
    .from(
      ".weegen2-dp",
      0.5,
      {
        scale: 3.5,
        opacity: 0,
        x: 25,
        y: -25,
        rotationZ: -45,
      },
      "-=2",
    )
    .staggerFrom(
      ".end-actions button",
      0.6,
      {
        opacity: 0,
        y: 20,
        scale: 0.8,
        ease: Back.easeOut,
      },
      0.25,
      "+=0.3",
    );

  // tl.seek("currentStep");
  // tl.timeScale(2);

  // Restart Animation on click
  const replyBtn = document.getElementById("replay");
  replyBtn.addEventListener("click", () => {
    tl.restart();
  });
};

// Run fetch and animation in sequence
fetchData();

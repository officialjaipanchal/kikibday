// Good things / Teasers for countdown
const goodThings = [
    "✨ 'The universe is preparing a magical day for you!'",
    "🎁 'Something crafted with love is waiting just around the corner...'",
    "💖 'Get ready for smiles, warmth, and birthday joy!'",
    "✨ 'Count down the moments to your special celebration!'",
    "🎈 'Keep smiling, Krishna! The magic starts at midnight!'",
    "🌟 'A special surprise is getting ready for you!'"
];

const fallbackTeasers = [
    {
        emoji: "🔐✨",
        title: "Nice Try, Krishna!",
        message: "The Birthday Vault is locked with 256-bit celebration encryption. You'll have to wait till midnight! 🤫"
    },
    {
        emoji: "🕵️‍♀️🎁",
        title: "Caught Red-Handed!",
        message: "Attempt #2 detected! 99% of secrets are still top secret... but your curiosity score is 100/100! 📈"
    },
    {
        emoji: "✨💖",
        title: "Patience, Birthday Queen!",
        message: "Great things take time. Here is an exclusive mini hint: Scratch the card below to reveal a secret clue! 👇"
    },
    {
        emoji: "🎉🎂",
        title: "You REALLY want a sneak peek?",
        message: "Okay okay! 1 real hint: Make sure your device volume is turned UP on Sept 25th midnight! 🎵✨"
    },
    {
        emoji: "🥳🎈",
        title: "Maximum Hype Level!",
        message: "You've unlocked maximum sneak-peek attempts! Tap the floating gifts & balloons on screen to burst confetti! 🎈✨"
    }
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
            y: (clientY - rect.top) * (canvas.height / rect.height)
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
    window.onmouseup = () => { isDrawing = false; };

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
    canvas.ontouchend = () => { isDrawing = false; };
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
    const collectiblesContainer = document.getElementById("floating-collectibles");
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

    const popTexts = [
        "🎉 Magic in the air! ✨",
        "💖 Birthday loading... ⏳",
        "🎈 Woohoo! 🥳",
        "✨ Almost time, Krishna! 🎂",
        "🤫 Secret surprise! 🎁",
        "🥳 Curiosity 100/100! 📈"
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
                colors: ["#ff4081", "#15a1ed", "#ffd700", "#ff80ab", "#7c4dff"]
            });

            // Side Cannon Blast
            setTimeout(() => {
                confetti({
                    particleCount: 30,
                    angle: 60,
                    spread: 60,
                    origin: { x: 0, y: 0.75 }
                });
                confetti({
                    particleCount: 30,
                    angle: 120,
                    spread: 60,
                    origin: { x: 1, y: 0.75 }
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

    // Countdown Timer Loop
    const updateTimer = () => {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;

        if (distance <= 0) {
            if (countdownScreen) countdownScreen.classList.add("hidden");
            animationTimeline();
            return false;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (daysEl) daysEl.innerText = String(days).padStart(2, "0");
        if (hoursEl) hoursEl.innerText = String(hours).padStart(2, "0");
        if (minutesEl) minutesEl.innerText = String(minutes).padStart(2, "0");
        if (secondsEl) secondsEl.innerText = String(seconds).padStart(2, "0");

        return true;
    };

    const isPending = updateTimer();
    if (!isPending) return;

    const timerInterval = setInterval(() => {
        const active = updateTimer();
        if (!active) clearInterval(timerInterval);
    }, 1000);

    // Dynamic Teaser / Mystery Vault Modal Trigger
    const teaserResponses = customConfig.teaserResponses || fallbackTeasers;
    const scratchCardHint = customConfig.scratchCardHint || "😜 Hint: 100% chance of cheesy birthday wishes, floating balloons & maximum silly drama!";
    let previewAttempts = parseInt(sessionStorage.getItem("kiki_preview_attempts") || "0", 10);

    if (previewBtn) {
        previewBtn.addEventListener("click", (e) => {
            triggerExcitement(e.clientX, e.clientY);

            previewAttempts++;
            sessionStorage.setItem("kiki_preview_attempts", previewAttempts);

            const kikiModal = document.getElementById("kiki-modal");
            const emojiEl = document.getElementById("kiki-emoji");
            const titleEl = document.getElementById("kiki-modal-title");
            const descEl = document.getElementById("kiki-modal-desc");
            const scratchWrapper = document.getElementById("scratch-card-wrapper");

            // Pick response based on attempt count
            const responseIdx = Math.min(previewAttempts - 1, teaserResponses.length - 1);
            const currentTeaser = teaserResponses[responseIdx];

            if (emojiEl) emojiEl.innerText = currentTeaser.emoji;
            if (titleEl) titleEl.innerText = currentTeaser.title;
            if (descEl) descEl.innerText = currentTeaser.message;

            // Show Scratch Card on attempt 3 and onwards
            if (previewAttempts >= 3 && scratchWrapper) {
                scratchWrapper.classList.remove("hidden");
                setupScratchCard(scratchCardHint);
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

// Import the data to customize and insert them into page
const fetchData = () => {
    fetch("customize.json")
        .then(data => data.json())
        .then(data => {
            const dataArr = Object.keys(data);
            dataArr.map(customData => {
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

            initCountdown(data.targetDate, data);
        })
        .catch(err => {
            console.warn("customize.json loading fallback:", err);
            initCountdown();
        });
};

// Animation Timeline
const animationTimeline = () => {
    // Split chars that need to be animated individually
    const textBoxChars = document.getElementsByClassName("hbd-chatbox")[0];
    const hbd = document.getElementsByClassName("wish-hbd")[0];

    if (textBoxChars) {
        textBoxChars.innerHTML = `<span>${textBoxChars.innerHTML
            .split("")
            .map(char => char === " " ? "&nbsp;" : char)
            .join("</span><span>")}</span>`;
    }

    if (hbd) {
        hbd.innerHTML = `<span>${hbd.innerHTML
            .split("")
            .map(char => char === " " ? "&nbsp;" : char)
            .join("</span><span>")}</span>`;
    }

    const ideaTextTrans = {
        opacity: 0,
        y: -20,
        rotationX: 5,
        skewX: "15deg"
    };

    const ideaTextTransLeave = {
        opacity: 0,
        y: 20,
        rotationY: 5,
        skewX: "-15deg"
    };

    const tl = new TimelineMax();

    tl
        .to(".container", 0.1, {
            visibility: "visible"
        })
        .from(".one", 0.7, {
            opacity: 0,
            y: 10
        })
        .from(".two", 0.4, {
            opacity: 0,
            y: 10
        })
        .to(
            ".one",
            0.7,
            {
                opacity: 0,
                y: 10
            },
            "+=2.5"
        )
        .to(
            ".two",
            0.7,
            {
                opacity: 0,
                y: 10
            },
            "-=1"
        )
        .from(".three", 0.7, {
            opacity: 0,
            y: 10
            // scale: 0.7
        })
        .to(
            ".three",
            0.7,
            {
                opacity: 0,
                y: 10
            },
            "+=2"
        )
        .from(".four", 0.7, {
            scale: 0.2,
            opacity: 0
        })
        .from(".fake-btn", 0.3, {
            scale: 0.2,
            opacity: 0
        })
        .staggerTo(
            ".hbd-chatbox span",
            0.5,
            {
                visibility: "visible"
            },
            0.05
        )
        .to(".fake-btn", 0.1, {
            backgroundColor: "rgb(127, 206, 248)"
        })
        .to(
            ".four",
            0.5,
            {
                scale: 0.2,
                opacity: 0,
                y: -150
            },
            "+=0.7"
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
            color: "#fff"
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
                opacity: 0
            },
            "+=0.5"
        )
        .to(
            ".idea-5 .smiley",
            0.7,
            {
                rotation: 180,
                x: 8
            },
            "+=0.4"
        )
        .to(
            ".idea-5",
            0.7,
            {
                scale: 0.2,
                opacity: 0
            },
            "+=2"
        )
        .staggerFrom(
            ".idea-6 span",
            0.8,
            {
                scale: 3,
                opacity: 0,
                rotation: 15,
                ease: Expo.easeOut
            },
            0.2
        )
        .staggerTo(
            ".idea-6 span",
            0.8,
            {
                scale: 3,
                opacity: 0,
                rotation: -15,
                ease: Expo.easeOut
            },
            0.2,
            "+=1"
        )
        .staggerFromTo(
            ".baloons img",
            2.5,
            {
                opacity: 0.9,
                y: 1400
            },
            {
                opacity: 1,
                y: -1000
            },
            0.2
        )
        .from(
            ".weegen-dp",
            0.5,
            {
                scale: 3.5,
                opacity: 0,
                x: 25,
                y: -25,
                rotationZ: -45
            },
            "-=2"
        )
        .from(".hat", 0.5, {
            x: -100,
            y: 350,
            rotation: -180,
            opacity: 0
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
                ease: Elastic.easeOut.config(1, 0.5)
            },
            0.1
        )
        .staggerFromTo(
            ".wish-hbd span",
            0.7,
            {
                scale: 1.4,
                rotationY: 150
            },
            {
                scale: 1,
                rotationY: 0,
                color: "#ff69b4",
                ease: Expo.easeOut
            },
            0.1,
            "party"
        )
        .call(() => {
            if (typeof confetti === "function") {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                setTimeout(() => {
                    confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } });
                    confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } });
                }, 400);
            }
        })
        .from(
            ".wish h5",
            0.5,
            {
                opacity: 0,
                y: 10,
                skewX: "-15deg"
            },
            "party"
        )
        .staggerTo(
            ".eight svg",
            1.5,
            {
                visibility: "visible",
                opacity: 0,
                scale: 80,
                repeat: 3,
                repeatDelay: 1.4
            },
            0.3
        )
        .to(".six", 0.5, {
            opacity: 0,
            y: 30,
            zIndex: "-1"
        })
        .staggerFrom(".nine p", 1, ideaTextTrans, 1.2)
        .to(
            ".last-smile",
            0.5,
            {
                rotation: 180
            },
            "+=1"
        )
        .from(
            ".weegen2-dp",
            0.5,
            {
                scale: 3.5,
                opacity: 0,
                x: 25,
                y: -25,
                rotationZ: -45
            },
            "-=2"
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
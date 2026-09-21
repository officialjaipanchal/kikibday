// Good things / Teasers for countdown
const goodThings = [
    "✨ 'The universe is preparing a magical day for you!'",
    "🎁 'Something crafted with love is waiting just around the corner...'",
    "💖 'Get ready for smiles, warmth, and birthday joy!'",
    "✨ 'Count down the moments to your special celebration!'",
    "🎈 'Keep smiling, Krishna! The magic starts at midnight!'",
    "🌟 'A special surprise is getting ready for you!'"
];

const isPreviewMode = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has("preview") || urlParams.get("preview") === "true";
};

// Countdown Controller
const initCountdown = (targetDateStr) => {
    const countdownScreen = document.getElementById("countdown-screen");
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");
    const goodThingEl = document.getElementById("good-thing-text");
    const previewBtn = document.getElementById("preview-btn");

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

    if (previewBtn) {
        previewBtn.addEventListener("click", () => {
            const kikiModal = document.getElementById("kiki-modal");
            if (kikiModal) {
                kikiModal.classList.remove("hidden");
            }
        });
    }

    const closeKikiBtn = document.getElementById("close-kiki-modal");
    if (closeKikiBtn) {
        closeKikiBtn.addEventListener("click", () => {
            const kikiModal = document.getElementById("kiki-modal");
            if (kikiModal) {
                kikiModal.classList.add("hidden");
            }
        });
    }
};

// Import the data to customize and insert them into page
const fetchData = () => {
    fetch("customize.json")
        .then(data => data.json())
        .then(data => {
            const dataArr = Object.keys(data);
            dataArr.map(customData => {
                if (data[customData] !== "") {
                    const el = document.querySelector(`[data-node-name*="${customData}"]`);
                    if (el) {
                        if (customData === "imagePath" || customData === "image2Path") {
                            el.setAttribute("src", data[customData]);
                        } else {
                            el.innerText = data[customData];
                        }
                    }
                }

                // Check if iteration is over
                if (dataArr.length === dataArr.indexOf(customData) + 1) {
                    initCountdown(data.targetDate);
                }
            });
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
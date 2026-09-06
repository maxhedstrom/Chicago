/* ===========================
   GLOBAL STATE
=========================== */

let players = [];
let history = [];
let historyIndex = -1;

// Win counter (does NOT reset between rounds)
let totalWins = {};


/* ===========================
   HISTORY SYSTEM (Undo/Redo)
=========================== */

function saveHistory() {
    history = history.slice(0, historyIndex + 1);
    history.push(JSON.parse(JSON.stringify(players)));
    historyIndex = history.length - 1;
    updateUndoRedoButtons();
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        players = JSON.parse(JSON.stringify(history[historyIndex]));
        render();
    }
    updateUndoRedoButtons();
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        players = JSON.parse(JSON.stringify(history[historyIndex]));
        render();
    }
    updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById("undoBtn");
    const redoBtn = document.getElementById("redoBtn");

    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= history.length - 1;

    undoBtn.style.opacity = undoBtn.disabled ? "0.4" : "1";
    redoBtn.style.opacity = redoBtn.disabled ? "0.4" : "1";
}

document.getElementById("undoBtn").addEventListener("click", undo);
document.getElementById("redoBtn").addEventListener("click", redo);

/* ===========================
   FIREWORKS
=========================== */

function launchFireworks() {
    const container = document.getElementById("fireworks");
    if (!container) return;

    // Gör containern fullskärm på toppen
    container.classList.remove("hidden");
    container.style.position = "fixed";
    container.style.left = "0";
    container.style.top = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.pointerEvents = "none";
    container.style.zIndex = "9999";

    for (let i = 0; i < 40; i++) {
        const fw = document.createElement("div");
        fw.className = "firework";

        // Minimal styling if CSS saknas
        fw.style.position = "absolute";
        fw.style.width = "6px";
        fw.style.height = "6px";
        fw.style.borderRadius = "50%";
        fw.style.background = "radial-gradient(circle, #fbbf24, #ef4444)";
        fw.style.opacity = "0.9";

        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 120;

        const dx = Math.cos(angle) * distance + "px";
        const dy = Math.sin(angle) * distance + "px";

        fw.style.left = window.innerWidth / 2 + "px";
        fw.style.top = window.innerHeight / 2 + "px";

        fw.style.setProperty("--dx", dx);
        fw.style.setProperty("--dy", dy);

        // enkel animation via transform + fade
        fw.animate(
            [
                { transform: "translate(0,0)", opacity: 1 },
                { transform: `translate(${dx}, ${dy})`, opacity: 0 }
            ],
            {
                duration: 900,
                easing: "ease-out",
                fill: "forwards"
            }
        );

        container.appendChild(fw);

        setTimeout(() => fw.remove(), 950);
    }

    setTimeout(() => container.classList.add("hidden"), 1200);
}


/* ===========================
   NEW GAME KNAPP
=========================== */

const newGameBtn = document.getElementById("newGameBtn");

if (newGameBtn) {
    newGameBtn.addEventListener("click", () => {
        players.forEach(p => {
            p.score = 0;
            p.pp = 0;
            p.ow = 0;
            p.cp = 0;
            p.dead = false;
            p.deathFlashPlayed = false;
        });

        newGameBtn.classList.add("hidden");
        newGameBtn.style.display = "none";

        saveHistory();
        render();
    });
}


/* ===========================
   DOM ELEMENTS
=========================== */

const nameInput = document.getElementById("nameInput");
const addBtn = document.getElementById("addBtn");
const resetBtn = document.getElementById("resetBtn");
const resetPlayersBtn = document.getElementById("resetPlayersBtn");
const playerList = document.getElementById("playerList");
const warningBox = document.getElementById("warning");

const toggleOW = document.getElementById("toggleOW");

const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");
const rulesScreen = document.getElementById("rulesScreen");
const scoreboardScreen = document.getElementById("scoreboardScreen");


/* ===========================
   NAVIGATION
=========================== */

document.getElementById("startBtn").addEventListener("click", () => {
    homeScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
});

document.getElementById("rulesBtn").addEventListener("click", () => {
    homeScreen.classList.add("hidden");
    rulesScreen.classList.remove("hidden");
});

document.getElementById("scoresBtn").addEventListener("click", () => {
    homeScreen.classList.add("hidden");
    scoreboardScreen.classList.remove("hidden");
});

document.getElementById("backFromRules").addEventListener("click", () => {
    rulesScreen.classList.add("hidden");
    homeScreen.classList.remove("hidden");
});

document.getElementById("backFromScoreboard").addEventListener("click", () => {
    scoreboardScreen.classList.add("hidden");
    homeScreen.classList.remove("hidden");
});


/* ===========================
   TOGGLE EXTRAS
=========================== */

let showExtras = false;

toggleOW.addEventListener("change", () => {
    showExtras = toggleOW.checked;
    render();
});


/* ===========================
   FUNNY NAMES
=========================== */

const funnyNames = {
    "martin": "Grinkuk",
    "niels": "Max Little Dog",
    "niles": "Max Little Dog",
    "ruben": "Grinkuken från Belgien",
    "max": "Toepe King"
};


/* ===========================
   ADD PLAYER
=========================== */

addBtn.addEventListener("click", () => {
    let name = nameInput.value.trim();
    if (!name) return;

    const key = name.toLowerCase();
    if (funnyNames[key]) name = funnyNames[key];

    players.push({
        name,
        score: 0,
        pp: 0,
        ow: 0,
        cp: 0,
        dead: false,
        deathFlashPlayed: false
    });

    nameInput.value = "";

    saveHistory();
    render();
});


/* ===========================
   RESET BUTTONS
=========================== */

resetBtn.addEventListener("click", () => {
    players.forEach(p => {
        p.score = 0;
        p.pp = 0;
        p.ow = 0;
        p.cp = 0;
        p.dead = false;
        p.deathFlashPlayed = false;
    });

    saveHistory();
    render();
});

resetPlayersBtn.addEventListener("click", () => {
    players = [];
    if (newGameBtn) {
        newGameBtn.classList.add("hidden");
        newGameBtn.style.display = "none";
    }
    render();
    updateState();
});


/* ===========================
   UPDATE STATE
=========================== */

function updateState() {
    if (players.length < 2) {
        resetBtn.disabled = true;
        warningBox.classList.remove("hidden");
    } else {
        resetBtn.disabled = false;
        warningBox.classList.add("hidden");
    }
}


/* ===========================
   SCORING LOGIC (WIN + TROPHY)
=========================== */

function changeScore(i, key, amount) {

    const player = players[i];
    player[key] += amount;

    // PP loops 0 → 1 → 2 → 0
    if (key === "pp") {
        if (player.pp > 2) player.pp = 0;
        if (player.pp < 0) player.pp = 2;
    }

    // CP rule: 4 CP → +1 score
    if (player.cp >= 4) {
        player.cp = 0;
        player.score++;
    }

    // OW rule: 2 OW → +1 score
    if (player.ow >= 2) {
        player.ow = 0;
        player.score++;
    }

    // Detect death
    let deathHappened = false;

    if (player.score >= 15) {
        player.score = 15;

        if (!player.dead) {
            player.dead = true;
            player.deathFlashPlayed = false;
            deathHappened = true;
        }
    }

    // WINNER CHECK – direkt när någon dör
    if (deathHappened) {
        const alive = players.filter(p => !p.dead);

        if (alive.length === 1 && players.length > 1) {
            const winner = alive[0];

            // Trophy uppdatering
            totalWins[winner.name] = (totalWins[winner.name] || 0) + 1;

            // Visa New Game-knappen, oavsett CSS
            if (newGameBtn) {
                newGameBtn.classList.remove("hidden");
                newGameBtn.style.display = "block";
            }

            // Fyrverkerier
            launchFireworks();
        }
    }

    saveHistory();
    render();
}


/* ===========================
   RENDER UI
=========================== */

function render() {
    updateState();
    playerList.innerHTML = "";

    players.forEach((p, i) => {
        const div = document.createElement("div");
        div.className = "player";

        const disableClass = p.dead ? "disabled" : "";

        // Trophy display
        const wins = totalWins[p.name] || 0;
        const trophyHTML = wins > 0 ? ` <span class="trophy">🏆 x${wins}</span>` : "";

        // Danger warning vid 14
        const dangerHTML = (p.score === 14 && !p.dead)
            ? `<div class="danger-text">⚠️ One point from getting smoked!</div>`
            : "";

        // Death overlay
        let deathHTML = "";
        if (p.dead) {
            deathHTML = `
                <div class="${p.deathFlashPlayed ? "death-overlay-static" : "death-overlay"}">
                    <div class="${p.deathFlashPlayed ? "death-text-static" : "death-text"}">💀 Smoked</div>
                </div>`;
        }

        if (p.dead && !p.deathFlashPlayed) {
            p.deathFlashPlayed = true;
        }

        // Extra OW/CP
        let extrasSection = "";
        if (showExtras) {
            extrasSection = `
                <div class="score-group ow">
                    <div class="score-label">OW</div>
                    <div class="score-controls">
                        <button class="icon-btn minus ${disableClass}" onclick="changeScore(${i}, 'ow', -1)">−</button>
                        <div class="score-value">${p.ow}</div>
                        <button class="icon-btn plus ${disableClass}" onclick="changeScore(${i}, 'ow', 1)">+</button>
                    </div>
                </div>
                <div class="score-group cp">
                    <div class="score-label">CP</div>
                    <div class="score-controls">
                        <button class="icon-btn minus ${disableClass}" onclick="changeScore(${i}, 'cp', -1)">−</button>
                        <div class="score-value">${p.cp}</div>
                        <button class="icon-btn plus ${disableClass}" onclick="changeScore(${i}, 'cp', 1)">+</button>
                    </div>
                </div>`;
        }

        div.innerHTML = `
            <div class="player-header">
                <div class="player-name">${p.name}${trophyHTML}</div>
            </div>

            ${dangerHTML}

            <div class="player-scores">

                <div class="score-group points">
                    <div class="score-label">Points</div>
                    <div class="score-controls">
                        <button class="icon-btn minus ${disableClass}" onclick="changeScore(${i}, 'score', -1)">−</button>
                        <div class="score-value">${p.score}</div>
                        <button class="icon-btn plus ${disableClass}" onclick="changeScore(${i}, 'score', 1)">+</button>
                    </div>
                </div>

                <div class="score-group pp">
                    <div class="score-label">Pussy Points</div>
                    <div class="score-controls">
                        <button class="icon-btn minus ${disableClass}" onclick="changeScore(${i}, 'pp', -1)">−</button>
                        <div class="score-value">${p.pp}</div>
                        <button class="icon-btn plus ${disableClass}" onclick="changeScore(${i}, 'pp', 1)">+</button>
                    </div>
                </div>

                ${extrasSection}

            </div>

            ${deathHTML}
        `;

        playerList.appendChild(div);
    });
}


/* ===========================
   DISABLE DOUBLE TAP ZOOM
=========================== */

// Stoppar double-tap zoom men låter snabb spam fungera
let lastTouch = 0;

document.addEventListener("touchstart", function (e) {
    const now = Date.now();
    if (now - lastTouch <= 300) {
        e.preventDefault(); // stoppa zoom
    }
    lastTouch = now;
}, { passive: false });

// Stoppa pinch-zoom helt
document.addEventListener("gesturestart", function (e) {
    e.preventDefault();
}, { passive: false });


/* ===========================
   SERVICE WORKER
=========================== */

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
}

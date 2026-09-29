let chicagoPlayers = [];
let chicagoSelected = null;
let chicagoWinner = null;
let chicagoHistory = [];
let chicagoHistoryIndex = -1;

const chicagoScreen = document.getElementById("chicagoScreen");
const chicagoPlayerList = document.getElementById("chicagoPlayerList");
const chicagoNameInput = document.getElementById("chicagoNameInput");
const chicagoWinnerBanner = document.getElementById("chicagoWinnerBanner");

function extraHandsOn() {
    const el = document.getElementById("toggleChicagoHands");
    return Boolean(el && el.checked);
}

function syncExtraHands() {
    renderChicago();
}


function chicagoSnapshot() {
    return {
        players: JSON.parse(JSON.stringify(chicagoPlayers)),
        selected: chicagoSelected,
        winner: chicagoWinner
    };
}

function saveChicagoHistory() {
    chicagoHistory = chicagoHistory.slice(0, chicagoHistoryIndex + 1);
    chicagoHistory.push(chicagoSnapshot());
    chicagoHistoryIndex = chicagoHistory.length - 1;
}

function applyChicagoSnapshot(entry) {
    chicagoPlayers = JSON.parse(JSON.stringify(entry.players));
    chicagoSelected = entry.selected;
    chicagoWinner = entry.winner;
}

function selectedChicagoPlayer() {
    return chicagoPlayers.find(p => p.name === chicagoSelected) || null;
}

function refreshCanWin(player) {
    player.canWin = player.score >= 52;
}

function applyDelta(player, delta) {
    if (chicagoWinner) return;
    player.score += delta;
    refreshCanWin(player);
    chicagoSelected = player.name;
    saveChicagoHistory();
    renderChicago();
}

function applyNamedEvent(player, type) {
    if (chicagoWinner) return;

    if (type === "RoyalStraightFlush") {
        const result = applyRoyalStraightFlush(player);
        if (result.ok) chicagoWinner = player.name;
        saveChicagoHistory();
        renderChicago();
        return;
    }

    applyChicagoRound(chicagoPlayers, [{ player: player.name, type }]);
    chicagoSelected = player.name;
    saveChicagoHistory();
    renderChicago();
}

function applySelectedEvent(type) {
    const player = selectedChicagoPlayer();
    if (!player) {
        alert("Tryck på en spelare först.");
        return;
    }
    applyNamedEvent(player, type);
}

function renderChicago() {
    chicagoPlayerList.innerHTML = "";

    if (chicagoWinnerBanner) {
        if (chicagoWinner) {
            chicagoWinnerBanner.textContent = chicagoWinner + " vann!";
            chicagoWinnerBanner.classList.remove("hidden");
        } else {
            chicagoWinnerBanner.classList.add("hidden");
        }
    }

    const locked = Boolean(chicagoWinner);

    chicagoPlayers.forEach(p => {
        const div = document.createElement("div");
        div.className = "player";
        if (p.name === chicagoSelected) div.classList.add("chicago-selected");
        if (p.name === chicagoWinner) div.classList.add("chicago-winner");

        const header = document.createElement("div");
        header.className = "player-header chicago-card-header";
        const title = document.createElement("div");
        title.className = "player-name";
        title.textContent = p.name;
        const total = document.createElement("div");
        total.className = "chicago-score";
        total.textContent = String(p.score);
        header.append(title, total);
        div.appendChild(header);

        if (p.canWin && p.name !== chicagoWinner) {
            const mark = document.createElement("div");
            mark.className = "danger-text";
            mark.textContent = "⚠️ Kan gå ut";
            div.appendChild(mark);
        }

        if (p.name === chicagoWinner) {
            const mark = document.createElement("div");
            mark.className = "danger-text";
            mark.textContent = "🏆 Vinnare";
            div.appendChild(mark);
        }

        const scores = document.createElement("div");
        scores.className = "player-scores";

        scores.appendChild(scoreGroup(p, "Par", "+1", 1, "points", locked));
        scores.appendChild(scoreGroup(p, "Utspel", "+5", 5, "pp", locked));
        div.appendChild(scores);

        if (extraHandsOn()) {
            div.appendChild(playerHandsMenu(p, locked));
        }

        if (p.canWin && p.name !== chicagoWinner) {
            const go = document.createElement("button");
            go.className = "chicago-go-out";
            go.textContent = "Gå ut";
            go.addEventListener("click", (e) => {
                e.stopPropagation();
                const result = applyGoOut(p);
                if (result.ok) {
                    chicagoWinner = p.name;
                    saveChicagoHistory();
                    renderChicago();
                }
            });
            div.appendChild(go);
        }

        div.addEventListener("click", (e) => {
            if (e.target.closest("button")) return;
            if (locked) return;
            chicagoSelected = p.name;
            renderChicago();
        });

        chicagoPlayerList.appendChild(div);
    });
}



const HAND_EVENTS = [
    ["TvaPar", "Två par +2"],
    ["Triss", "Triss +3"],
    ["Stege", "Stege +4"],
    ["Farg", "Färg +5"],
    ["Kak", "Kåk +6"],
    ["Fyrtal", "Fyrtal +8"],
    ["FyrtalNollstall", "Fyrtal nollställ"],
    ["Fargstege", "Färgstege +11"],
    ["RoyalFlush", "Royal Flush +20"],
    ["ChicagoLyckad", "Chicago +15"],
    ["ChicagoMisslyckad", "Chicago −15"],
    ["RoyalStraightFlush", "Royal Straight Flush"]
];

function playerHandsMenu(player, locked) {
    const wrap = document.createElement("div");
    wrap.className = "chicago-player-menu";
    HAND_EVENTS.forEach(([type, label]) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = label;
        btn.disabled = locked;
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            applyNamedEvent(player, type);
        });
        wrap.appendChild(btn);
    });
    return wrap;
}

function scoreGroup(player, label, plusLabel, delta, extraClass, locked) {
    const group = document.createElement("div");
    group.className = "score-group " + extraClass;

    const lab = document.createElement("div");
    lab.className = "score-label";
    lab.textContent = label;
    group.appendChild(lab);

    const controls = document.createElement("div");
    controls.className = "score-controls";

    const minus = document.createElement("button");
    minus.className = "icon-btn minus";
    minus.textContent = "−";
    minus.disabled = locked;
    minus.addEventListener("click", (e) => {
        e.stopPropagation();
        applyDelta(player, -delta);
    });

    const value = document.createElement("div");
    value.className = "score-value";
    value.textContent = plusLabel;

    const plus = document.createElement("button");
    plus.className = "icon-btn plus";
    plus.textContent = "+";
    plus.disabled = locked;
    plus.addEventListener("click", (e) => {
        e.stopPropagation();
        applyDelta(player, delta);
    });

    controls.append(minus, value, plus);
    group.appendChild(controls);
    return group;
}

function newChicagoGame() {
    chicagoPlayers.forEach(p => {
        p.score = 0;
        p.canWin = false;
    });
    chicagoWinner = null;
    saveChicagoHistory();
    renderChicago();
}

document.getElementById("chicagoBtn").addEventListener("click", () => {
    document.getElementById("chicagoHubScreen").classList.add("hidden");
    chicagoScreen.classList.remove("hidden");
    if (chicagoHistory.length === 0) saveChicagoHistory();
    renderChicago();
});

document.getElementById("backFromChicago").addEventListener("click", () => {
    chicagoScreen.classList.add("hidden");
    document.getElementById("chicagoHubScreen").classList.remove("hidden");
});

document.getElementById("backToLandingFromChicago").addEventListener("click", () => {
    document.getElementById("chicagoHubScreen").classList.add("hidden");
    document.getElementById("landingScreen").classList.remove("hidden");
});

document.getElementById("chicagoRulesBtn").addEventListener("click", () => {
    document.getElementById("chicagoHubScreen").classList.add("hidden");
    document.getElementById("chicagoRulesScreen").classList.remove("hidden");
});
document.getElementById("backFromChicagoRules").addEventListener("click", () => {
    document.getElementById("chicagoRulesScreen").classList.add("hidden");
    document.getElementById("chicagoHubScreen").classList.remove("hidden");
});
document.getElementById("chicagoScoresBtn").addEventListener("click", () => {
    document.getElementById("chicagoHubScreen").classList.add("hidden");
    document.getElementById("chicagoScoreboardScreen").classList.remove("hidden");
});
document.getElementById("backFromChicagoScores").addEventListener("click", () => {
    document.getElementById("chicagoScoreboardScreen").classList.add("hidden");
    document.getElementById("chicagoHubScreen").classList.remove("hidden");
});

document.getElementById("chicagoAddBtn").addEventListener("click", () => {
    const name = chicagoNameInput.value.trim();
    if (!name) return;
    if (chicagoPlayers.some(p => p.name.toLowerCase() === name.toLowerCase())) return;
    chicagoPlayers.push(createChicagoPlayer(name));
    chicagoNameInput.value = "";
    if (!chicagoSelected) chicagoSelected = name;
    saveChicagoHistory();
    renderChicago();
});

chicagoNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("chicagoAddBtn").click();
});

document.querySelectorAll("[data-chicago-event]").forEach(btn => {
    btn.addEventListener("click", () => applySelectedEvent(btn.dataset.chicagoEvent));
});

document.getElementById("chicagoUndoBtn").addEventListener("click", () => {
    if (chicagoHistoryIndex > 0) {
        chicagoHistoryIndex--;
        applyChicagoSnapshot(chicagoHistory[chicagoHistoryIndex]);
        renderChicago();
    }
});

document.getElementById("chicagoRedoBtn").addEventListener("click", () => {
    if (chicagoHistoryIndex < chicagoHistory.length - 1) {
        chicagoHistoryIndex++;
        applyChicagoSnapshot(chicagoHistory[chicagoHistoryIndex]);
        renderChicago();
    }
});

document.getElementById("chicagoNewGameBtn").addEventListener("click", newChicagoGame);

document.getElementById("chicagoResetPlayersBtn").addEventListener("click", () => {
    chicagoPlayers = [];
    chicagoSelected = null;
    chicagoWinner = null;
    saveChicagoHistory();
    renderChicago();
});


const toggleChicagoHands = document.getElementById("toggleChicagoHands");
if (toggleChicagoHands) {
    toggleChicagoHands.addEventListener("change", syncExtraHands);
    syncExtraHands();
}

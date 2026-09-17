let chicagoPlayers = [];
let chicagoSelected = null;

const chicagoScreen = document.getElementById("chicagoScreen");
const chicagoPlayerList = document.getElementById("chicagoPlayerList");
const chicagoNameInput = document.getElementById("chicagoNameInput");

function selectedChicagoPlayer() {
    return chicagoPlayers.find(p => p.name === chicagoSelected) || null;
}

function applySelectedEvent(type) {
    const player = selectedChicagoPlayer();
    if (!player) {
        alert("Välj en spelare först.");
        return;
    }
    applyChicagoRound(chicagoPlayers, [{ player: player.name, type }]);
    renderChicago();
}

function renderChicago() {
    chicagoPlayerList.innerHTML = "";

    chicagoPlayers.forEach(p => {
        const div = document.createElement("div");
        div.className = "player";
        if (p.name === chicagoSelected) div.classList.add("chicago-selected");

        const title = document.createElement("div");
        title.className = "player-name";
        title.textContent = p.name + "  " + p.score + (p.canWin ? "  • kan gå ut" : "");
        div.appendChild(title);

        if (p.canWin) {
            const go = document.createElement("button");
            go.className = "home-btn";
            go.textContent = "Gå ut";
            go.addEventListener("click", (e) => {
                e.stopPropagation();
                const result = applyGoOut(p);
                if (result.ok) alert(p.name + " vann!");
                renderChicago();
            });
            div.appendChild(go);
        }

        div.addEventListener("click", () => {
            chicagoSelected = p.name;
            renderChicago();
        });

        chicagoPlayerList.appendChild(div);
    });
}

document.getElementById("chicagoBtn").addEventListener("click", () => {
    document.getElementById("homeScreen").classList.add("hidden");
    chicagoScreen.classList.remove("hidden");
    renderChicago();
});

document.getElementById("backFromChicago").addEventListener("click", () => {
    chicagoScreen.classList.add("hidden");
    document.getElementById("homeScreen").classList.remove("hidden");
});

document.getElementById("chicagoAddBtn").addEventListener("click", () => {
    const name = chicagoNameInput.value.trim();
    if (!name) return;
    if (chicagoPlayers.some(p => p.name === name)) return;
    chicagoPlayers.push(createChicagoPlayer(name));
    chicagoNameInput.value = "";
    if (!chicagoSelected) chicagoSelected = name;
    renderChicago();
});

document.querySelectorAll("[data-chicago-event]").forEach(btn => {
    btn.addEventListener("click", () => applySelectedEvent(btn.dataset.chicagoEvent));
});

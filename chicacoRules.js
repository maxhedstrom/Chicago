const CHICAGO_TARGET = 52;

const CHICAGO_HAND_POINTS = {
    Par: 1,
    TvaPar: 2,
    Triss: 3,
    Stege: 4,
    Farg: 5,
    Kak: 6,
    Fyrtal: 8,
    Fargstege: 11,
    RoyalFlush: 20
};

function createChicagoPlayer(name) {
    return { name, score: 0, canWin: false };
}

function applyChicagoEvent(player, eventType) {
    if (eventType === "Utspel") player.score += 5;
    else if (eventType === "ChicagoLyckad") player.score += 15;
    else if (eventType === "ChicagoMisslyckad") player.score -= 15;
    else if (eventType in CHICAGO_HAND_POINTS) player.score += CHICAGO_HAND_POINTS[eventType];
    else throw new Error("Okänd Chicago-händelse: " + eventType);

    player.canWin = player.score >= CHICAGO_TARGET;
    return player;
}

function canGoOut(player) {
    return player.canWin === true;
}
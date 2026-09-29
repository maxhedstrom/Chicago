const START = new Date(2022, 10, 19);
const TRIP = new Date(2026, 10, 28);

function daysBetween(from, to) {
    const ms = 24 * 60 * 60 * 1000;
    const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
    const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
    return Math.floor((b - a) / ms);
}

const today = new Date();
const together = daysBetween(START, today);
const untilTrip = daysBetween(today, TRIP);

document.getElementById("together").textContent = together.toLocaleString("sv-SE");

const tripEl = document.getElementById("trip");
if (untilTrip > 1) tripEl.textContent = untilTrip + " dagar";
else if (untilTrip === 1) tripEl.textContent = "i morgon";
else if (untilTrip === 0) tripEl.textContent = "idag";
else tripEl.textContent = "har varit";

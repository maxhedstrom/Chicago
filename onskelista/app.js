const list = document.getElementById("list");
const empty = document.getElementById("empty");
const wishes = Array.isArray(window.WISHES) ? window.WISHES.filter(w => w && w.title) : [];

if (!wishes.length) empty.classList.remove("hidden");

wishes.forEach((wish) => {
    const li = document.createElement("li");
    li.className = "item";

    const title = document.createElement("h2");
    title.textContent = wish.title;
    li.appendChild(title);

    if (wish.note) {
        const note = document.createElement("p");
        note.textContent = wish.note;
        li.appendChild(note);
    }

    if (wish.link) {
        const a = document.createElement("a");
        a.href = wish.link;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = "Till butiken";
        li.appendChild(a);
    }

    list.appendChild(li);
});

document.addEventListener("DOMContentLoaded", () => {
    const resultsGrid = document.getElementById("resultsGrid");
    const showModeBtn = document.getElementById("show-mode-btn");
    const actorModeBtn = document.getElementById("actor-mode-btn");
    const shuffleBtn = document.getElementById("shuffle-btn");
    const themeToggle = document.getElementById("theme-toggle");

    let currentMode = "shows";

    themeToggle.addEventListener("click", () => document.body.classList.toggle("light-mode"));

    async function loadData() {
        resultsGrid.innerHTML = '<p class="text-slate-400">Loading data...</p>';
        try {
            const url = currentMode === "shows" ? "https://api.tvmaze.com/schedule?country=US" : "https://api.tvmaze.com/search/people?q=a";
            const res = await fetch(url);
            const data = await res.json();
            
            resultsGrid.innerHTML = "";
            const items = data.slice(0, 9);
            
            items.forEach(item => {
                const obj = item.show || item.person;
                const card = document.createElement("div");
                card.className = "bg-slate-800 p-4 rounded-2xl shadow-lg";
                card.innerHTML = `
                    <img src="${obj.image?.medium || ''}" class="w-full h-64 object-cover rounded-xl mb-4 bg-slate-700">
                    <h3 class="font-bold text-lg">${obj.name}</h3>
                `;
                resultsGrid.appendChild(card);
            });
        } catch (e) {
            resultsGrid.innerHTML = '<p class="text-red-500">Connection error. Please refresh.</p>';
        }
    }

    showModeBtn.addEventListener("click", () => { currentMode = "shows"; loadData(); });
    actorModeBtn.addEventListener("click", () => { currentMode = "actors"; loadData(); });
    shuffleBtn.addEventListener("click", loadData);

    loadData();
});
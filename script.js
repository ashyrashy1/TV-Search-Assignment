document.addEventListener("DOMContentLoaded", () => {
    // ---- UI DOM MAPPINGS ----
    const showModeBtn = document.getElementById("show-mode-btn");
    const actorModeBtn = document.getElementById("actor-mode-btn");
    const resultsGrid = document.getElementById("resultsGrid");
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;

    // ---- STATE ----
    let currentMode = "shows";

    // ---- 1. THEME TOGGLE LOGIC ----
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            body.classList.toggle("light-mode");
        });
    }

    // ---- 2. TVMAZE API FETCH ENGINE ----
    async function fetchData(query = "") {
        // Clear grid and show loading state
        resultsGrid.innerHTML = `
            <div class="col-span-full py-10 text-center animate-pulse">
                <p class="text-indigo-400 font-bold">Syncing with TVMaze API...</p>
            </div>
        `;

        const url = query 
            ? `https://api.tvmaze.com/search/${currentMode}?q=${query}`
            : `https://api.tvmaze.com/schedule`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            renderResults(data);
        } catch (error) {
            resultsGrid.innerHTML = `<p class="col-span-full text-center text-red-500">Failed to connect to TVMaze API.</p>`;
        }
    }

    // ---- 3. RENDER ENGINE ----
    function renderResults(data) {
        resultsGrid.innerHTML = "";
        
        data.forEach(item => {
            const obj = item.show || item.person || item;
            const name = obj.name || "Unknown";
            const img = obj.image?.medium || "https://via.placeholder.com/210x295?text=No+Image";

            const card = document.createElement("div");
            card.className = "bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg";
            card.innerHTML = `
                <img src="${img}" class="w-full h-64 object-cover rounded-lg mb-4">
                <h3 class="font-bold text-lg">${name}</h3>
                <p class="text-xs text-slate-400 mt-2">${currentMode === 'shows' ? 'TV Show' : 'Actor'}</p>
            `;
            resultsGrid.appendChild(card);
        });
    }

    // ---- 4. MODE SWITCHERS ----
    showModeBtn.addEventListener("click", () => {
        currentMode = "shows";
        showModeBtn.classList.add("bg-indigo-600");
        actorModeBtn.classList.remove("bg-indigo-600");
        fetchData();
    });

    actorModeBtn.addEventListener("click", () => {
        currentMode = "people";
        actorModeBtn.classList.add("bg-indigo-600");
        showModeBtn.classList.remove("bg-indigo-600");
        fetchData();
    });

    // Initial Load
    fetchData();
});
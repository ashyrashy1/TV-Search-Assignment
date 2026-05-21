document.addEventListener("DOMContentLoaded", () => {
    const showModeBtn = document.getElementById("show-mode-btn");
    const actorModeBtn = document.getElementById("actor-mode-btn");
    const resultsGrid = document.getElementById("resultsGrid");
    const themeToggle = document.getElementById("theme-toggle");

    let currentMode = "shows";

    // 1. Theme Toggle Logic
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
    });

    // 2. Optimized Fetch Function
    async function fetchData(query = "") {
        resultsGrid.innerHTML = `<p class="col-span-full text-center">Loading...</p>`;
        
        // Switch API endpoint based on mode
        const endpoint = currentMode === "shows" ? "shows" : "people";
        const url = query 
            ? `https://api.tvmaze.com/search/${endpoint}?q=${query}`
            : `https://api.tvmaze.com/schedule`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            renderResults(data);
        } catch (error) {
            resultsGrid.innerHTML = `<p class="col-span-full text-center text-red-500">Error loading data.</p>`;
        }
    }

    // 3. Render Engine (Correctly handles Shows vs Actors)
    function renderResults(data) {
        resultsGrid.innerHTML = "";
        data.forEach(item => {
            // Data structure from TVMaze differs for shows vs people
            const obj = item.show || item.person;
            if (!obj) return; 

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

    // 4. UI Listeners
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

    fetchData(); // Initial load
});
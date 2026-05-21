document.addEventListener("DOMContentLoaded", () => {
    const showModeBtn = document.getElementById("show-mode-btn");
    const actorModeBtn = document.getElementById("actor-mode-btn");
    const resultsGrid = document.getElementById("resultsGrid");
    const themeToggle = document.getElementById("theme-toggle");

    let currentMode = "shows";

    // Theme Switch
    themeToggle.addEventListener("click", () => document.body.classList.toggle("light-mode"));

    // Fetch and Render
    async function fetchData() {
        resultsGrid.innerHTML = `<p class="text-slate-400">Loading...</p>`;
        
        // Use different endpoints for shows vs people
        const url = currentMode === "shows" 
            ? "https://api.tvmaze.com/schedule" 
            : "https://api.tvmaze.com/search/people?q=a";

        try {
            const res = await fetch(url);
            const data = await res.json();
            resultsGrid.innerHTML = "";
            
            data.forEach(item => {
                const obj = item.show || item.person || item;
                const card = document.createElement("div");
                card.className = "bg-slate-800 p-4 rounded-xl border border-slate-700";
                card.innerHTML = `
                    <img src="${obj.image?.medium || 'https://via.placeholder.com/210x295'}" class="w-full h-64 object-cover rounded-lg mb-4">
                    <h3 class="font-bold">${obj.name}</h3>
                    <p class="text-xs text-slate-400">${currentMode === 'shows' ? 'TV Show' : 'Actor'}</p>
                `;
                resultsGrid.appendChild(card);
            });
        } catch (e) { resultsGrid.innerHTML = `<p class="text-red-500">Error loading data.</p>`; }
    }

    showModeBtn.addEventListener("click", () => {
        currentMode = "shows";
        showModeBtn.className = "flex-1 py-2 text-sm font-medium bg-indigo-600 rounded-lg text-white";
        actorModeBtn.className = "flex-1 py-2 text-sm font-medium rounded-lg text-slate-400";
        fetchData();
    });

    actorModeBtn.addEventListener("click", () => {
        currentMode = "actors";
        actorModeBtn.className = "flex-1 py-2 text-sm font-medium bg-indigo-600 rounded-lg text-white";
        showModeBtn.className = "flex-1 py-2 text-sm font-medium rounded-lg text-slate-400";
        fetchData();
    });

    fetchData();
});
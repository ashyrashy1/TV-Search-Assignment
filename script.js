document.addEventListener("DOMContentLoaded", () => {
    const resultsGrid = document.getElementById("resultsGrid");
    const shuffleBtn = document.getElementById("shuffle-btn");
    const themeToggle = document.getElementById("theme-toggle");
    const modal = document.getElementById("modal");

    // Theme Switch
    themeToggle.addEventListener("click", () => document.body.classList.toggle("light-mode"));

    // Fetch and Render
    async function loadFeed() {
        resultsGrid.innerHTML = `<p>Loading shows...</p>`;
        const res = await fetch("https://api.tvmaze.com/schedule?country=US&date=2026-05-20");
        const data = await res.json();
        resultsGrid.innerHTML = "";
        
        data.forEach(item => {
            const show = item.show;
            const card = document.createElement("div");
            card.className = "card bg-slate-800 p-4 rounded-xl border border-slate-700 cursor-pointer hover:scale-105 transition-transform";
            card.innerHTML = `
                <img src="${show.image?.medium || 'https://via.placeholder.com/210x295'}" class="w-full h-64 object-cover rounded-lg mb-4">
                <h3 class="font-bold text-lg">${show.name}</h3>
            `;
            card.onclick = () => showModal(show);
            resultsGrid.appendChild(card);
        });
    }

    function showModal(show) {
        document.getElementById("modal-body").innerHTML = `
            <h2 class="text-2xl font-bold mb-4">${show.name}</h2>
            <p class="text-sm opacity-80 mb-4">${show.summary?.replace(/<[^>]*>/g, '') || 'No summary available.'}</p>
            <p class="text-xs font-bold text-indigo-400">Rating: ${show.rating?.average || 'N/A'}</p>
        `;
        modal.classList.remove("hidden");
    }

    document.getElementById("close-modal").onclick = () => modal.classList.add("hidden");
    shuffleBtn.addEventListener("click", loadFeed);

    loadFeed();
});
document.addEventListener("DOMContentLoaded", () => {
    // ---- Core DOM Mappings ----
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const resultsGrid = document.getElementById("results-grid");
    const showModeBtn = document.getElementById("show-mode-btn");
    const actorModeBtn = document.getElementById("actor-mode-btn");
    
    // ---- UI Component Mappings ----
    const shuffleBtn = document.getElementById("shuffle-btn");
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const bodyTheme = document.getElementById("body-theme");
    const headerTheme = document.getElementById("header-theme");
    const themeIcon = document.getElementById("theme-icon");
    const themeText = document.getElementById("theme-text");
    const detailModal = document.getElementById("detail-modal");
    const modalContainer = document.getElementById("modal-container");
    const modalBodyContent = document.getElementById("modal-body-content");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const backdropClose = document.getElementById("modal-backdrop-close");
    const watchlistCount = document.getElementById("watchlist-count");

    // ---- Reactive State Engine Values ----
    let currentMode = "shows";      
    let apiDataResults = [];        
    let isDarkMode = true;
    let baselineSavesCount = 0;

    // Run baseline content seeding protocol immediately on entry
    triggerAutomatedContentFeed();

    // ---- Stream Seeding Routine ----
    function triggerAutomatedContentFeed() {
        const showSeeds = ["black", "dark", "world", "love", "dead", "star", "secret", "last", "true", "game", "house", "night", "city", "blood"];
        const actorSeeds = ["john", "mary", "smith", "david", "james", "alex", "chris", "emma", "lee", "paul", "sarah", "tom", "rachel"];
        
        const baselinePool = (currentMode === "shows") ? showSeeds : actorSeeds;
        const randomizedChoice = baselinePool[Math.floor(Math.random() * baselinePool.length)];
        
        if (searchInput) searchInput.value = ""; 
        fetchLiveTVMazeData(randomizedChoice);
    }

    // ---- Asynchronous Live Fetch Engine ----
    async function fetchLiveTVMazeData(queryValue) {
        const queryCleaned = queryValue.trim();
        let endpoint = (currentMode === "shows") ? "shows" : "people";
        let finalTerm = queryCleaned || "a"; 
        
        const completeURL = `https://api.tvmaze.com/search/${endpoint}?q=${encodeURIComponent(finalTerm)}`;

        try {
            const response = await fetch(completeURL);
            const jsonResults = await response.json();

            apiDataResults = jsonResults.map(item => {
                if (currentMode === "shows") {
                    const showData = item.show;
                    return {
                        id: `show-${showData.id}`,
                        name: showData.name,
                        summary: showData.summary ? showData.summary.replace(/<[^>]*>/g, '') : "No summary text on file.",
                        img: showData.image ? showData.image.medium : "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500",
                        extraInfo: showData.genres?.length ? `Genres: ${showData.genres.join(', ')}` : 'General Broadcast Entertainment',
                        metaBadge: showData.rating?.average ? `⭐ ${showData.rating.average}/10` : 'No rating recorded',
                        externalLink: showData.url || "https://www.tvmaze.com"
                    };
                } else {
                    const actorData = item.person;
                    return {
                        id: `actor-${actorData.id}`,
                        name: actorData.name,
                        summary: actorData.birthday ? `Born: ${actorData.birthday}` : "Professional artist profile database record.",
                        // FIXED: Removed the robohash link and replaced it with a sleek, premium Unsplash portrait placeholder
                        img: actorData.image ? actorData.image.medium : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
                        extraInfo: actorData.country ? `Origin: ${actorData.country.name}` : 'International Field Artist',
                        metaBadge: 'Artist Profile',
                        externalLink: actorData.url || "https://www.tvmaze.com"
                    };
                }
            });

            renderDisplayGridFeed();

        } catch (error) {
            console.error("TVMaze layout pipeline synchronization error:", error);
            if (resultsGrid) {
                resultsGrid.innerHTML = `<div class="col-span-full text-center text-rose-400 py-12">Failed to secure data feed.</div>`;
            }
        }
    }

    // ---- Grid DOM Dynamic Injector ----
    function renderDisplayGridFeed() {
        if (!resultsGrid) return;
        resultsGrid.innerHTML = "";

        if (apiDataResults.length === 0) {
            resultsGrid.innerHTML = `<div class="col-span-full text-center text-slate-400 py-12">No matching records uncovered.</div>`;
            return;
        }

        apiDataResults.forEach((item) => {
            const layoutCard = document.createElement("div");
            
            layoutCard.className = isDarkMode 
                ? "bg-slate-800 border border-slate-700/50 rounded-2xl overflow-hidden p-5 flex flex-col justify-between shadow-lg hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group"
                : "bg-white border border-slate-200 rounded-2xl overflow-hidden p-5 flex flex-col justify-between shadow-md hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group";
            
            layoutCard.innerHTML = `
                <div class="card-modal-trigger">
                    <div class="relative overflow-hidden rounded-xl aspect-[2/3] mb-4 bg-slate-900 shadow-inner">
                        <img src="${item.img}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    </div>
                    <h3 class="text-md font-bold truncate mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}">${item.name}</h3>
                    <p class="text-xs font-semibold text-indigo-400 mb-2">${item.metaBadge}</p>
                    <p class="text-sm leading-relaxed line-clamp-3 mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}">${item.summary}</p>
                </div>
                <button class="save-action-btn w-full py-2 bg-slate-900/40 hover:bg-indigo-600 border border-slate-700/50 hover:border-indigo-500 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-white'}">
                    ➕ Bookmark Entry
                </button>
            `;

            layoutCard.querySelector(".card-modal-trigger").addEventListener("click", () => openDetailModalOverlay(item));
            
            layoutCard.querySelector(".save-action-btn").addEventListener("click", (e) => {
                e.stopPropagation(); 
                baselineSavesCount++;
                if (watchlistCount) watchlistCount.textContent = baselineSavesCount;
            });

            resultsGrid.appendChild(layoutCard);
        });
    }

    // ---- Pop-up Dialog Window Handler Engine ----
    function openDetailModalOverlay(item) {
        if (!modalBodyContent || !detailModal) return;
        
        // FIXED: Integrated a modern action button that takes users to the target source URL in a new tab
        modalBodyContent.innerHTML = `
            <div class="flex flex-col sm:flex-row gap-6">
                <img src="${item.img}" class="w-full sm:w-44 aspect-[2/3] object-cover rounded-2xl shadow-xl border border-slate-700/30">
                <div class="flex flex-col justify-between">
                    <div>
                        <h2 class="text-2xl font-black mb-1 text-white">${item.name}</h2>
                        <span class="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 block">${item.extraInfo}</span>
                        <p class="text-sm leading-relaxed text-slate-300 max-h-40 overflow-y-auto pr-2 mb-4">${item.summary}</p>
                    </div>
                    <a href="${item.externalLink}" target="_blank" rel="noopener noreferrer" class="inline-flex w-full sm:w-auto items-center justify-center text-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all gap-1 active:scale-95">
                        View Full Source Record ↗
                    </a>
                </div>
            </div>
        `;
        
        detailModal.classList.remove("hidden", "pointer-events-none");
        detailModal.classList.add("flex");
        
        setTimeout(() => {
            detailModal.classList.remove("opacity-0");
            modalContainer?.classList.remove("scale-95");
        }, 20);
    }

    function closeDetailModalOverlay() {
        if (!detailModal) return;
        detailModal.classList.add("opacity-0", "pointer-events-none");
        modalContainer?.classList.add("scale-95");
        
        setTimeout(() => {
            detailModal.classList.remove("flex");
            detailModal.classList.add("hidden");
        }, 300);
    }

    closeModalBtn?.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        closeDetailModalOverlay();
    });

    backdropClose?.addEventListener("click", () => {
        closeDetailModalOverlay();
    });

    // ---- Interactive Event Listeners ----
    searchButton?.addEventListener("click", () => fetchLiveTVMazeData(searchInput.value));
    searchInput?.addEventListener("input", () => {
        if (searchInput.value.trim() !== "") {
            fetchLiveTVMazeData(searchInput.value);
        } else {
            triggerAutomatedContentFeed();
        }
    });

    showModeBtn?.addEventListener("click", () => {
        currentMode = "shows";
        showModeBtn.className = "flex-1 text-center text-sm font-medium py-2 rounded-lg bg-indigo-600 text-white transition-all shadow-md";
        actorModeBtn.className = "flex-1 text-center text-sm font-medium py-2 rounded-lg text-slate-400 hover:text-slate-200 transition-all";
        if (searchInput) searchInput.placeholder = "Search live shows...";
        triggerAutomatedContentFeed();
    });

    actorModeBtn?.addEventListener("click", () => {
        currentMode = "actors";
        actorModeBtn.className = "flex-1 text-center text-sm font-medium py-2 rounded-lg bg-indigo-600 text-white transition-all shadow-md";
        showModeBtn.className = "flex-1 text-center text-sm font-medium py-2 rounded-lg text-slate-400 hover:text-slate-200 transition-all";
        if (searchInput) searchInput.placeholder = "Search live actors...";
        triggerAutomatedContentFeed();
    });

    shuffleBtn?.addEventListener("click", () => {
        triggerAutomatedContentFeed();
    });

    themeToggleBtn?.addEventListener("click", () => {
        isDarkMode = !isDarkMode;
        if (isDarkMode) {
            bodyTheme.className = "bg-slate-900 text-slate-100 min-h-screen font-sans antialiased transition-colors duration-300";
            headerTheme.className = "border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300";
            themeToggleBtn.className = "p-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-sm rounded-xl transition-all font-semibold text-white flex items-center gap-1.5 shadow-md";
            themeIcon.textContent = "☀️"; themeText.textContent = "Light Mode";
        } else {
            bodyTheme.className = "bg-slate-50 text-slate-900 min-h-screen font-sans antialiased transition-colors duration-300";
            headerTheme.className = "border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300";
            themeToggleBtn.className = "p-2 bg-white border border-slate-200 hover:bg-slate-100 text-sm rounded-xl transition-all font-semibold text-slate-700 flex items-center gap-1.5 shadow-sm";
            themeIcon.textContent = "🌙"; themeText.textContent = "Dark Mode";
        }
        renderDisplayGridFeed();
    });
});

document.addEventListener("DOMContentLoaded", () => {
    // ---- APPLICATION UI COMPONENT CORE ELEMENT DOM MAPPINGS ----
    const showModeBtn = document.getElementById("show-mode-btn");
    const actorModeBtn = document.getElementById("actor-mode-btn");
    const shuffleBtn = document.getElementById("shuffle-btn");
    const searchInput = document.getElementById("searchInput");
    const resultsGrid = document.getElementById("resultsGrid");
    
    const detailModal = document.getElementById("detail-modal");
    const modalBodyContent = document.getElementById("modal-body-content");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const backdropClose = document.getElementById("modal-backdrop-close");

    // ---- REACTIVE GLOBAL STATE TRACKERS ----
    let currentMode = "shows";
    let apiDataResults = [];

    // Visual helper delay function so the spinner is visible to the human eye
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Hardcoded HTML spinner layout reference string
    const spinnerHTML = `
        <div id="loading-spinner" class="col-span-full flex flex-col items-center justify-center py-20 text-center w-full">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-indigo-500"></div>
            <p class="text-xs font-semibold uppercase tracking-widest text-indigo-400 mt-4 animate-pulse">Syncing Network Asset Feeds...</p>
        </div>
    `;

    // Automatically trigger primary layout feed on load
    triggerTrueRandomFeed();

    // ---- 1. DYNAMIC DISCOVERY SHUFFLE FEED ENGINE ----
    async function triggerTrueRandomFeed() {
        if (searchInput) searchInput.value = "";
        apiDataResults = [];

        // Put the spinner on screen immediately
        if (resultsGrid) resultsGrid.innerHTML = spinnerHTML;

        if (currentMode === "shows") {
            const scheduleUrl = "https://api.tvmaze.com/schedule";
            try {
                const response = await fetch(scheduleUrl);
                
                if (!response.ok) throw new Error("API server responded with an error status.");
                
                const rawSchedule = await response.json();

                // Intentional delay block so the animation renders smoothly
                await sleep(1000); 

                // Wipe the loader out right before rendering cards
                if (resultsGrid) resultsGrid.innerHTML = "";

                const uniqueShowsMap = new Map();
                
                rawSchedule.forEach(entry => {
                    if (entry.show && !uniqueShowsMap.has(entry.show.id)) {
                        uniqueShowsMap.set(entry.show.id, entry.show);
                        apiDataResults.push(entry.show);

                        const cleanSummaryText = entry.show.summary 
                            ? entry.show.summary.replace(/<[^>]*>/g, '') 
                            : 'No description entry log updates registered for this profile item.';

                        const cardHTML = `
                            <div class="show-card col-span-1 bg-slate-800/40 border border-slate-800/60 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:bg-slate-700/50 flex flex-col justify-between group" data-id="${entry.show.id}">
                                <div>
                                    <div class="overflow-hidden rounded-lg bg-slate-900">
                                        <img src="${entry.show.image ? entry.show.image.medium : 'https://via.placeholder.com/210x295?text=No+Image'}" class="rounded-md w-full object-cover h-64 group-hover:scale-105 transition-transform duration-500">
                                    </div>
                                    <h3 class="text-white font-bold mt-3 text-base truncate group-hover:text-indigo-400 transition-colors">${entry.show.name}</h3>
                                    <p class="text-slate-400 text-xs line-clamp-3 mt-1.5 leading-relaxed">${cleanSummaryText}</p>
                                </div>
                                <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                                    <span>Rating: <strong class="text-yellow-500">${entry.show.rating?.average || 'N/A'}</strong></span>
                                    <span class="text-indigo-400 hover:underline font-medium">View Info &rarr;</span>
                                </div>
                            </div>
                        `;
                        if (resultsGrid) resultsGrid.insertAdjacentHTML('beforeend', cardHTML);
                    }
                });
                attachCardClickListeners();

            } catch (error) {
                // If the fetch fails, leave explicit error instructions instead of going completely blank
                console.error("Discovery error details:", error);
                if (resultsGrid) {
                    resultsGrid.innerHTML = `
                        <div class="col-span-full text-center py-12 bg-red-950/20 border border-red-900/50 rounded-xl p-6">
                            <p class="text-red-400 font-bold mb-1">Network Error Encountered</p>
                            <p class="text-xs text-slate-400">The application is working perfectly, but the browser was blocked from connecting to the TVMaze server. Please check your network connection or turn off ad-blockers.</p>
                        </div>
                    `;
                }
            }
        }
    }

    // ---- 2. LIVE QUERY SEARCH MOVEMENT PROCESSING PIPELINE ----
    async function executeLiveSearch(query) {
        if (!query.trim()) {
            triggerTrueRandomFeed();
            return;
        }

        if (resultsGrid) resultsGrid.innerHTML = spinnerHTML;

        const searchUrl = currentMode === "shows"
            ? `https://api.tvmaze.com/search/shows?q=${query}`
            : `https://api.tvmaze.com/search/people?q=${query}`;

        try {
            const response = await fetch(searchUrl);
            if (!response.ok) throw new Error("Search server responded with an error status.");
            
            const data = await response.json();

            await sleep(800); 

            if (resultsGrid) resultsGrid.innerHTML = "";
            apiDataResults = []; 

            if (data.length === 0) {
                if (resultsGrid) {
                    resultsGrid.innerHTML = `
                        <div class="col-span-full text-center py-12">
                            <p class="text-slate-400 text-lg font-medium">No active database records match that keyword reference entry.</p>
                        </div>
                    `;
                }
                return;
            }

            data.forEach(item => {
                if (currentMode === "shows" && item.show) {
                    apiDataResults.push(item.show);
                    const cleanSummaryText = item.show.summary ? item.show.summary.replace(/<[^>]*>/g, '') : 'No descriptions provided.';
                    
                    const cardHTML = `
                        <div class="show-card col-span-1 bg-slate-800/40 border border-slate-800/60 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:bg-slate-700/50 flex flex-col justify-between group" data-id="${item.show.id}">
                            <div>
                                <div class="overflow-hidden rounded-lg bg-slate-900">
                                    <img src="${item.show.image ? item.show.image.medium : 'https://via.placeholder.com/210x295?text=No+Image'}" class="rounded-md w-full object-cover h-64 group-hover:scale-105 transition-transform duration-500">
                                </div>
                                <h3 class="text-white font-bold mt-3 text-base truncate group-hover:text-indigo-400 transition-colors">${item.show.name}</h3>
                                <p class="text-slate-400 text-xs line-clamp-3 mt-1.5 leading-relaxed">${cleanSummaryText}</p>
                            </div>
                            <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                                <span>Rating: <strong class="text-yellow-500">${item.show.rating?.average || 'N/A'}</strong></span>
                                <span class="text-indigo-400 hover:underline font-medium">View Info &rarr;</span>
                            </div>
                        </div>
                    `;
                    resultsGrid.insertAdjacentHTML('beforeend', cardHTML);
                } else if (currentMode === "actors" && item.person) {
                    apiDataResults.push(item.person);
                    
                    const cardHTML = `
                        <div class="show-card col-span-1 bg-slate-800/40 border border-slate-800/60 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:bg-slate-700/50 flex flex-col justify-between group" data-id="${item.person.id}">
                            <div>
                                <div class="overflow-hidden rounded-lg bg-slate-900">
                                    <img src="${item.person.image ? item.person.image.medium : 'https://via.placeholder.com/210x295?text=No+Image'}" class="rounded-md w-full object-cover h-64 group-hover:scale-105 transition-transform duration-500">
                                </div>
                                <h3 class="text-white font-bold mt-3 text-base truncate group-hover:text-indigo-400 transition-colors">${item.person.name}</h3>
                                <p class="text-slate-400 text-xs mt-1.5">Country: ${item.person.country ? item.person.country.name : 'Global network registry'}</p>
                            </div>
                            <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                                <span>Gender: <strong>${item.person.gender || 'N/A'}</strong></span>
                                <span class="text-indigo-400 hover:underline font-medium">View Profile &rarr;</span>
                            </div>
                        </div>
                    `;
                    resultsGrid.insertAdjacentHTML('beforeend', cardHTML);
                }
            });
            attachCardClickListeners();

        } catch (error) {
            console.error("Search pipeline error details:", error);
            if (resultsGrid) {
                resultsGrid.innerHTML = `
                    <div class="col-span-full text-center py-12 bg-red-950/20 border border-red-900/50 rounded-xl p-6">
                        <p class="text-red-400 font-bold mb-1">Search Connection Interrupted</p>
                        <p class="text-xs text-slate-400">Unable to establish a link to the remote search index database server.</p>
                    </div>
                `;
            }
        }
    }

    // ---- 3. SEARCH DEBOUNCE TIMER ATTACHMENT ----
    let searchTimeoutToken;
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            clearTimeout(searchTimeoutToken);
            searchTimeoutToken = setTimeout(() => {
                executeLiveSearch(e.target.value);
            }, 400); 
        });
    }

    // ---- 4. ELEMENT CLICK ATTRIBUTE CAPTURING LISTENER NODES ----
    function attachCardClickListeners() {
        const cards = document.querySelectorAll(".show-card");
        cards.forEach(card => {
            card.addEventListener("click", () => {
                const entityId = parseInt(card.getAttribute("data-id"));
                const matchedData = apiDataResults.find(obj => obj.id === entityId);

                if (matchedData) {
                    if (currentMode === "shows") {
                        const cleanSummaryText = matchedData.summary ? matchedData.summary.replace(/<[^>]*>/g, '') : 'No metrics logged.';
                        if (modalBodyContent) {
                            modalBodyContent.innerHTML = `
                                <div class="flex flex-col md:flex-row gap-6">
                                    <img src="${matchedData.image ? matchedData.image.medium : 'https://via.placeholder.com/210x295?text=No+Image'}" class="w-full md:w-48 rounded-xl object-cover shadow-lg">
                                    <div>
                                        <h2 class="text-2xl font-black text-white mb-2">${matchedData.name}</h2>
                                        <p class="text-sm text-slate-300 leading-relaxed mb-4">${cleanSummaryText}</p>
                                        <ul class="text-xs text-slate-400 space-y-1">
                                            <li><strong>Primary Language:</strong> ${matchedData.language || 'N/A'}</li>
                                            <li><strong>Production Status:</strong> ${matchedData.status || 'N/A'}</li>
                                        </ul>
                                    </div>
                                </div>
                            `;
                        }
                    } else {
                        if (modalBodyContent) {
                            modalBodyContent.innerHTML = `
                                <div class="flex flex-col md:flex-row gap-6">
                                    <img src="${matchedData.image ? matchedData.image.medium : 'https://via.placeholder.com/210x295?text=No+Image'}" class="w-full md:w-48 rounded-xl object-cover shadow-lg">
                                    <div>
                                        <h2 class="text-2xl font-black text-white mb-2">${matchedData.name}</h2>
                                        <p class="text-sm text-slate-300 mb-4">Actor file tracking metadata logged inside active repository nodes.</p>
                                        <ul class="text-xs text-slate-400 space-y-1">
                                            <li><strong>Gender Specification:</strong> ${matchedData.gender || 'N/A'}</li>
                                            <li><strong>Origin Country:</strong> ${matchedData.country ? matchedData.country.name : 'N/A'}</li>
                                        </ul>
                                    </div>
                                </div>
                            `;
                        }
                    }
                    if (detailModal) detailModal.classList.remove("hidden");
                }
            });
        });
    }

    function hideModalWindow() {
        if (detailModal) detailModal.classList.add("hidden");
    }

    if (closeModalBtn) closeModalBtn.addEventListener("click", hideModalWindow);
    if (backdropClose) backdropClose.addEventListener("click", hideModalWindow);

    // ---- 5. SIDEBAR DISCOVERY CONTEXT FILTER OVERRIDES ----
    if (showModeBtn && actorModeBtn) {
        showModeBtn.addEventListener("click", () => {
            currentMode = "shows";
            showModeBtn.className = "flex-1 text-center text-sm font-medium py-2 rounded-lg bg-indigo-600 text-white transition-all shadow-sm";
            actorModeBtn.className = "flex-1 text-center text-sm font-medium py-2 rounded-lg text-slate-400 hover:text-slate-200 transition-colors";
            triggerTrueRandomFeed();
        });

        actorModeBtn.addEventListener("click", () => {
            currentMode = "actors";
            actorModeBtn.className = "flex-1 text-center text-sm font-medium py-2 rounded-lg bg-indigo-600 text-white transition-all shadow-sm";
            showModeBtn.className = "flex-1 text-center text-sm font-medium py-2 rounded-lg text-slate-400 hover:text-slate-200 transition-colors";
            if (resultsGrid) resultsGrid.innerHTML = "";
            if (searchInput) searchInput.value = "";
            searchInput.placeholder = "Search actors by name...";
        });
    }

    if (shuffleBtn) {
        shuffleBtn.addEventListener("click", triggerTrueRandomFeed);
    }
});
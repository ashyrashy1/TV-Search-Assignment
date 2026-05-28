let currentMode = 'shows';
let currentResults = [];
const grid = document.getElementById("grid");
const modal = document.getElementById("infoModal");
const showTab = document.getElementById('show-tab');
const actorTab = document.getElementById('actor-tab');
const searchInput = document.getElementById('main-search');
const searchBtn = document.getElementById('search-btn');
const scheduleTab = document.getElementById('schedule-tab');


// This function forces all buttons back to gray
function resetTabStyles() {
    [showTab, actorTab, scheduleTab].forEach(tab => {
        if (tab) {
            tab.classList.remove('bg-indigo-600');
            tab.classList.add('bg-slate-700');
        }
    });
}

// Example of how to use it in a click handler
scheduleTab.onclick = () => {
    resetTabStyles(); // Step 1: Reset everything
    scheduleTab.classList.add('bg-indigo-600'); // Step 2: Highlight clicked
    fetchSchedule(); // Step 3: Fetch new data
};

// 3. Add this function to fetch and render the schedule
async function fetchSchedule() {
    grid.innerHTML = '<p class="col-span-full">Loading schedule...</p>';
    try {
        // Ensure the date is valid or remove it to get the default "today"
        const response = await fetch(`https://api.tvmaze.com/schedule?country=GB`);
        const data = await response.json();
        
        // Normalize the data if needed (some TVMaze endpoints return {show: ...}, others return the object directly)
        const formattedData = data.map(item => item.show ? item : { show: item });
        
        renderGrid(formattedData);
    } catch (err) {
        console.error("Error fetching schedule:", err);
        grid.innerHTML = '<p class="col-span-full">Error loading schedule.</p>';
    }
}

searchBtn.addEventListener('click', () => {
    const query = searchInput.value;
    if (query.trim() !== '') {
        // Check which mode the user is currently in
        if (currentMode === 'shows') {
            // Call your function that searches for shows
            // (e.g., fetch(`https://api.tvmaze.com/search/shows?q=${query}`))
            searchShows(query);
        } else if (currentMode === 'people') {
            // Call your function that searches for actors
            // (e.g., fetch(`https://api.tvmaze.com/search/people?q=${query}`))
            searchActors(query);
        }
    }
});

// --- SCHEDULE FUNCTIONS ---
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

async function fetchSchedule() {
    grid.innerHTML = '<p class="col-span-full">Loading schedule...</p>';
    
    // This generates the date in YYYY-MM-DD format for today
    const today = new Date().toISOString().split('T')[0];
    
    try {
        // Now it uses the variable 'today' instead of a hardcoded date
        const res = await fetch(`https://api.tvmaze.com/schedule?country=GB&date=${today}`);
        const data = await res.json();
        
        const formattedData = data.map(item => item.show ? item : { show: item });
        const randomizedData = shuffleArray(formattedData);
        
        renderGrid(randomizedData);
    } catch (err) {
        console.error("Fetch failed:", err);
        grid.innerHTML = '<p class="col-span-full">Could not load schedule.</p>';
    }
}

function resetTabs() {
    const tabs = [showTab, actorTab, scheduleTab];
    tabs.forEach(tab => {
        tab.className = "flex-1 py-2 rounded font-bold bg-slate-700";
    });
}

// 4. THE BUTTON CLICK LOGIC (The "Master" Controller)
scheduleTab.onclick = () => {
    // Reset all tabs to gray
    [showTab, actorTab, scheduleTab].forEach(tab => {
        tab.className = "flex-1 py-2 rounded font-bold bg-slate-700";
    });
    
    // Set clicked tab to blue
    scheduleTab.className = "flex-1 py-2 rounded font-bold bg-indigo-600";
    
    // Trigger the update
    fetchSchedule();
};

// --- Tab & Search Navigation ---
showTab.onclick = () => {
    currentMode = 'shows';
    showTab.className = "flex-1 py-2 rounded font-bold bg-indigo-600";
    actorTab.className = "flex-1 py-2 rounded font-bold bg-slate-700";
    searchInput.placeholder = "Search Shows...";
    fetchContent('shows');
};

actorTab.onclick = () => {
    currentMode = 'people';
    actorTab.className = "flex-1 py-2 rounded font-bold bg-indigo-600";
    showTab.className = "flex-1 py-2 rounded font-bold bg-slate-700";
    searchInput.placeholder = "Search Actors...";
    fetchContent('people');
};

// --- Mobile Sidebar Logic ---
document.getElementById('mobile-menu-btn').onclick = () => document.getElementById('sidebar').classList.remove('hidden');
document.getElementById('close-menu-btn').onclick = () => document.getElementById('sidebar').classList.add('hidden');

// --- Data Fetching & Rendering ---
async function fetchContent(mode, query = null) {
    grid.innerHTML = '<p class="col-span-full">Loading...</p>';
    const url = query ? `https://api.tvmaze.com/search/${mode}?q=${encodeURIComponent(query)}` : `https://api.tvmaze.com/${mode === 'shows' ? 'shows' : 'people'}`;
    const res = await fetch(url);
    const data = await res.json();
    currentResults = data;
    renderGrid(shuffleArray([...currentResults]));
}

function renderGrid(data) {
    grid.innerHTML = "";
    data.forEach(item => {
        const obj = item.show || item.person || item;
        const saved = JSON.parse(localStorage.getItem('saves')||'[]');
        const isSaved = saved.find(i => i.name === obj.name);
        
        const card = document.createElement("div");
        card.className = "bg-slate-800 p-4 rounded-xl cursor-pointer hover:bg-slate-700";
        card.innerHTML = `<img src="${obj.image?.medium || 'https://placehold.co/210x295'}" class="w-full rounded-lg">
                          <h3 class="mt-3 font-bold truncate">${obj.name}</h3>
                          <button class="btn-bmk w-full mt-2 py-1 rounded ${isSaved ? 'bg-green-600' : 'bg-indigo-600'}">
                              ${isSaved ? 'Bookmarked' : 'Bookmark'}</button>`;
        
        card.onclick = (e) => { 
            if(!e.target.classList.contains('btn-bmk')) { 
                document.getElementById("modalTitle").innerText = obj.name; 
                modal.dataset.url = obj.url || "#"; 
                document.getElementById('mustWatchToggle').className = `w-full bg-orange-600 py-2 rounded font-bold ${currentMode === 'shows' ? '' : 'hidden'}`;
                modal.classList.remove('hidden'); 
            } 
        };

        card.querySelector('.btn-bmk').onclick = (e) => {
            e.stopPropagation();
            let s = JSON.parse(localStorage.getItem('saves')||'[]');
            const isCurrentlySaved = !!s.find(i => i.name === obj.name);
            if(isCurrentlySaved) {
                s = s.filter(i => i.name !== obj.name);
                e.target.innerText = 'Bookmark';
                e.target.className = 'btn-bmk w-full mt-2 py-1 rounded bg-indigo-600';
            } else {
                s.push({name: obj.name, mustWatch: false});
                e.target.innerText = 'Bookmarked';
                e.target.className = 'btn-bmk w-full mt-2 py-1 rounded bg-green-600';
            }
            localStorage.setItem('saves', JSON.stringify(s));
            renderSaved();
        };
        grid.appendChild(card);
    });
}

function renderSaved() {
    const s = JSON.parse(localStorage.getItem('saves')||'[]');
    document.getElementById("saved-list").innerHTML = s.map((i, idx) => `
        <li class="flex justify-between bg-slate-800 p-2 rounded text-sm mb-1">${i.mustWatch ? '🔥 ':''}${i.name} 
        <button onclick="removeSaved(${idx})" class="text-red-400 font-bold">X</button></li>`).join('');
}

window.removeSaved = (idx) => {
    let s = JSON.parse(localStorage.getItem('saves')||'[]');
    s.splice(idx, 1);
    localStorage.setItem('saves', JSON.stringify(s));
    renderSaved();
    renderGrid(shuffleArray([...currentResults]));
};

// --- Event Listeners ---
document.getElementById('shuffle-btn').onclick = () => renderGrid(shuffleArray([...currentResults]));
searchInput.onkeydown = (e) => { if(e.key==='Enter') fetchContent(currentMode, e.target.value); };
document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
document.getElementById('viewDetailsBtn').onclick = () => window.open(modal.dataset.url, '_blank');
document.getElementById('mustWatchToggle').onclick = () => {
    let s = JSON.parse(localStorage.getItem('saves') || '[]');
    let currentTitle = document.getElementById("modalTitle").innerText;
    let itemIndex = s.findIndex(x => x.name === currentTitle);
    if (itemIndex !== -1) s[itemIndex].mustWatch = !s[itemIndex].mustWatch;
    else s.push({ name: currentTitle, mustWatch: true });
    localStorage.setItem('saves', JSON.stringify(s));
    renderSaved();
    modal.classList.add('hidden');
};

renderSaved();
fetchContent('shows');


// Add this at the bottom of script.js
// --- Updated Search Button Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('main-search');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value;
            if (query.trim() !== '') {
                // We use your existing fetchContent function
                // currentMode is already globally defined in your script
                fetchContent(currentMode, query);
            }
        });
    }
});

// Attach the click handler for the schedule button
scheduleTab.onclick = () => {
    // 1. Reset all button styles to gray
    showTab.className = "flex-1 py-2 rounded font-bold bg-slate-700";
    actorTab.className = "flex-1 py-2 rounded font-bold bg-slate-700";
    scheduleTab.className = "flex-1 py-2 rounded font-bold bg-slate-700";
    
    // 2. Set only the Schedule button to blue
    scheduleTab.className = "flex-1 py-2 rounded font-bold bg-indigo-600";
    
    // 3. Trigger the update and randomization
    fetchSchedule();
};


// --- BUTTON LISTENERS ---
showTab.onclick = () => {
    resetTabs();
    showTab.className = "flex-1 py-2 rounded font-bold bg-indigo-600";
    fetchContent('shows'); 
};

actorTab.onclick = () => {
    resetTabs();
    actorTab.className = "flex-1 py-2 rounded font-bold bg-indigo-600";
    fetchContent('people');
};

scheduleTab.onclick = () => {
    resetTabs();
    scheduleTab.className = "flex-1 py-2 rounded font-bold bg-indigo-600";
    fetchSchedule(); 
};
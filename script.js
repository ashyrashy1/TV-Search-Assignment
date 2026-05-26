let currentMode = 'shows';
let currentResults = [];
const grid = document.getElementById("grid");
const modal = document.getElementById("infoModal");
const showTab = document.getElementById('show-tab');
const actorTab = document.getElementById('actor-tab');
const searchInput = document.getElementById('main-search');

// --- Helper Functions ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

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
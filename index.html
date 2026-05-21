document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("resultsGrid");
    const modal = document.getElementById('infoModal');
    const savedList = document.getElementById('saved-list');
    const saveCount = document.getElementById('save-count');
    const showBtn = document.getElementById('mode-shows');
    const actorBtn = document.getElementById('mode-actors');
    const searchInput = document.getElementById('search-input');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const mustWatchToggle = document.getElementById('mustWatchToggle');
    const modalLink = document.getElementById('modalLink');
    
    let savedItems = JSON.parse(localStorage.getItem('cinetrack_saves')) || [];
    let lastData = [], lastType = 'shows';

    const updateListUI = () => {
        saveCount.innerText = `Session Saves: ${savedItems.length}`;
        savedList.innerHTML = savedItems.length === 0 ? '<li class="text-slate-500 italic">No items saved yet...</li>' : "";
        savedItems.forEach(item => {
            const li = document.createElement('li');
            li.className = "flex justify-between items-center text-indigo-400 font-bold truncate p-1";
            li.innerHTML = `<span>${item.mustWatch ? '🔥 ' : '★ '} ${item.name}</span><button class="remove-btn text-xs bg-red-900/50 px-2 py-0.5 rounded hover:bg-red-600">✕</button>`;
            li.querySelector('.remove-btn').onclick = () => {
                savedItems = savedItems.filter(i => i.name !== item.name);
                localStorage.setItem('cinetrack_saves', JSON.stringify(savedItems));
                updateListUI();
                render(lastData, lastType);
            };
            savedList.appendChild(li);
        });
    };

    const render = (data, type) => {
        lastData = data; lastType = type;
        showBtn.className = `flex-1 py-2 rounded-lg text-sm font-bold ${type === 'shows' ? 'bg-indigo-600' : 'bg-slate-700'}`;
        actorBtn.className = `flex-1 py-2 rounded-lg text-sm font-bold ${type === 'actors' ? 'bg-indigo-600' : 'bg-slate-700'}`;

        grid.innerHTML = "";
        data.slice(0, 9).forEach(item => {
            const obj = item.show || item.person;
            if (!obj) return;
            const savedItem = savedItems.find(i => i.name === obj.name);
            const card = document.createElement("div");
            card.className = "bg-[#1e293b] p-4 rounded-2xl cursor-pointer hover:bg-slate-700 transition";
            card.innerHTML = `
                <img src="${obj.image?.medium || 'https://via.placeholder.com/210x295'}" class="w-full h-64 object-cover rounded-xl mb-4 bg-slate-700">
                <h3 class="font-bold text-lg">${obj.name}</h3>
                <button class="bookmark-btn w-full ${savedItem ? 'bg-green-600' : 'bg-slate-900'} py-2 mt-4 rounded-lg text-xs font-bold transition">
                    ${savedItem ? '✓ Saved' : '+ Bookmark'}
                </button>
            `;
            
            card.onclick = (e) => {
                if (e.target.classList.contains('bookmark-btn')) return;
                document.getElementById('modalTitle').innerText = obj.name;
                document.getElementById('modalSummary').innerHTML = obj.summary || "No description available.";
                modalLink.href = obj.url || "#";
                
                const currentSavedItem = savedItems.find(i => i.name === obj.name);
                mustWatchToggle.style.display = type === 'shows' ? 'block' : 'none';
                mustWatchToggle.innerText = currentSavedItem?.mustWatch ? 'Remove from Must Watch' : 'Mark as Must Watch';
                
                mustWatchToggle.onclick = () => {
                    const itemIndex = savedItems.findIndex(i => i.name === obj.name);
                    if (itemIndex !== -1) {
                        savedItems[itemIndex].mustWatch = !savedItems[itemIndex].mustWatch;
                        localStorage.setItem('cinetrack_saves', JSON.stringify(savedItems));
                        updateListUI();
                        modal.classList.add('hidden');
                        render(lastData, lastType);
                    }
                };
                modal.classList.remove('hidden');
            };

            card.querySelector('.bookmark-btn').onclick = (e) => {
                e.stopPropagation();
                if (!savedItem) {
                    savedItems.push({ name: obj.name, mustWatch: false, url: obj.url });
                    localStorage.setItem('cinetrack_saves', JSON.stringify(savedItems));
                    updateListUI();
                    render(lastData, lastType);
                }
            };
            grid.appendChild(card);
        });
    };

    async function fetchData(url, type) {
        try {
            const res = await fetch(url.replace("http:", "https:"));
            let data = await res.json();
            if (type === 'shows' && url.includes('schedule')) data.sort(() => Math.random() - 0.5);
            render(data, type);
        } catch (e) { console.error(e); }
    }

    document.getElementById('theme-toggle').onclick = () => document.body.classList.toggle('light-mode');
    document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
    searchInput.onkeypress = (e) => { if (e.key === 'Enter') fetchData(`https://api.tvmaze.com/search/shows?q=${e.target.value}`, 'shows'); };
    shuffleBtn.onclick = () => fetchData("https://api.tvmaze.com/schedule?country=US", 'shows');
    showBtn.onclick = () => fetchData("https://api.tvmaze.com/schedule?country=US", 'shows');
    actorBtn.onclick = () => fetchData("https://api.tvmaze.com/search/people?q=a", 'actors');
    
    updateListUI();
    fetchData("https://api.tvmaze.com/schedule?country=US", 'shows');
});
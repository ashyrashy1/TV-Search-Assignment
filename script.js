document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("resultsGrid");
    const modal = document.getElementById('infoModal');
    const saveCountEl = document.getElementById('save-count');
    const savedList = document.getElementById('saved-list');
    const showBtn = document.getElementById('mode-shows');
    const actorBtn = document.getElementById('mode-actors');
    
    // Load from LocalStorage or start empty
    let savedItems = JSON.parse(localStorage.getItem('cinetrack_saves')) || [];
    let saveCount = savedItems.length;
    saveCountEl.innerText = saveCount;

    // Initialize list on load
    const updateListUI = () => {
        savedList.innerHTML = savedItems.length === 0 ? '<li class="text-slate-500 italic">No items saved yet...</li>' : "";
        savedItems.forEach(name => {
            const li = document.createElement('li');
            li.className = "flex justify-between items-center text-indigo-400 font-bold truncate p-1";
            li.innerHTML = `<span>★ ${name}</span><button class="remove-btn text-xs bg-red-900/50 px-2 py-0.5 rounded hover:bg-red-600">✕</button>`;
            li.querySelector('.remove-btn').onclick = () => removeItem(name, li);
            savedList.appendChild(li);
        });
    };

    const removeItem = (name, liElement) => {
        savedItems = savedItems.filter(item => item !== name);
        localStorage.setItem('cinetrack_saves', JSON.stringify(savedItems));
        saveCount = savedItems.length;
        saveCountEl.innerText = saveCount;
        liElement.remove();
        if (savedItems.length === 0) savedList.innerHTML = '<li class="text-slate-500 italic">No items saved yet...</li>';
        render(lastData, lastType); // Re-render to update button states
    };

    let lastData = [];
    let lastType = 'shows';

    const render = (data, type) => {
        lastData = data; lastType = type;
        grid.innerHTML = "";
        data.slice(0, 9).forEach(item => {
            const obj = item.show || item.person;
            const isSaved = savedItems.includes(obj.name);
            const card = document.createElement("div");
            card.className = "bg-[#1e293b] p-4 rounded-2xl cursor-pointer hover:bg-slate-700 transition";
            card.innerHTML = `
                <img src="${obj.image?.medium || 'https://via.placeholder.com/210x295'}" class="w-full h-64 object-cover rounded-xl mb-4 bg-slate-700">
                <h3 class="font-bold text-lg">${obj.name}</h3>
                <button class="bookmark-btn w-full ${isSaved ? 'bg-green-600' : 'bg-slate-900'} py-2 mt-4 rounded-lg text-xs font-bold transition hover:bg-black" ${isSaved ? 'disabled' : ''}>
                    ${isSaved ? '✓ Saved!' : '+ Bookmark Entry'}
                </button>
            `;
            
            card.onclick = (e) => {
                if (!e.target.classList.contains('bookmark-btn')) {
                    document.getElementById('modalTitle').innerText = obj.name;
                    document.getElementById('modalSummary').innerHTML = obj.summary || "No description available.";
                    document.getElementById('modalLink').href = obj.url || `https://www.tvmaze.com`;
                    modal.classList.remove('hidden');
                }
            };

            card.querySelector('.bookmark-btn').onclick = (e) => {
                e.stopPropagation();
                if (!savedItems.includes(obj.name)) {
                    savedItems.push(obj.name);
                    localStorage.setItem('cinetrack_saves', JSON.stringify(savedItems));
                    updateListUI();
                    saveCount = savedItems.length;
                    saveCountEl.innerText = saveCount;
                }
                render(lastData, lastType);
            };
            grid.appendChild(card);
        });
    };

    async function fetchData(url, type) {
        try {
            const res = await fetch(url.replace("http:", "https:"));
            let data = await res.json();
            if (type === 'shows' && !url.includes('search')) data.sort(() => Math.random() - 0.5);
            render(data, type);
        } catch (e) { grid.innerHTML = '<p class="text-red-500">Error loading data.</p>'; }
    }

    // Initialize
    updateListUI();
    document.getElementById('theme-toggle').onclick = () => document.body.classList.toggle('light-mode');
    document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
    document.getElementById('search-input').onkeypress = (e) => { if (e.key === 'Enter') fetchData(`https://api.tvmaze.com/search/shows?q=${e.target.value}`, 'shows'); };
    document.getElementById('mode-shows').onclick = () => fetchData("https://api.tvmaze.com/schedule?country=US", 'shows');
    document.getElementById('mode-actors').onclick = () => fetchData("https://api.tvmaze.com/search/people?q=a", 'actors');
    document.getElementById('shuffle-btn').onclick = () => fetchData("https://api.tvmaze.com/schedule?country=US", 'shows');
    fetchData("https://api.tvmaze.com/schedule?country=US", 'shows');
});

document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("resultsGrid"), modal = document.getElementById("infoModal"), savedList = document.getElementById("saved-list");
    let savedItems = JSON.parse(localStorage.getItem('cinetrack_saves')) || [];
    let lastData = [], lastType = 'shows';

    const updateUI = () => {
        savedList.innerHTML = "";
        savedItems.forEach((item, index) => {
            const li = document.createElement("li");
            li.className = "flex justify-between bg-slate-800 p-2 rounded text-sm items-center";
            li.innerHTML = `<span>${item.mustWatch ? '🔥 ' : ''}${item.name}</span><button onclick="removeSaved(${index})" class="text-red-400 font-bold ml-2">X</button>`;
            savedList.appendChild(li);
        });
    };

    window.removeSaved = (index) => {
        savedItems.splice(index, 1);
        localStorage.setItem('cinetrack_saves', JSON.stringify(savedItems));
        updateUI(); render(lastData);
    };

    const render = (data) => {
        grid.innerHTML = "";
        // FIX: Remove duplicates using a Map
        const uniqueData = [...new Map(data.map(item => [item.show?.name || item.person?.name, item])).values()];
        uniqueData.forEach(item => {
            const obj = item.show || item.person;
            if (!obj) return;
            const isSaved = savedItems.find(i => i.name === obj.name);
            const card = document.createElement("div");
            card.className = "bg-[#1e293b] p-4 rounded-xl cursor-pointer hover:bg-slate-700 transition";
            card.innerHTML = `<img src="${obj.image?.medium || 'https://via.placeholder.com/210x295'}" class="w-full h-48 object-cover rounded mb-2"><h3 class="font-bold">${obj.name}</h3><button class="bookmark-btn w-full ${isSaved ? 'bg-green-600' : 'bg-slate-900'} py-1 mt-2 rounded text-sm">${isSaved ? '✓ Saved' : '+ Bookmark'}</button>`;
            
            card.onclick = () => {
                document.getElementById('modalTitle').innerText = obj.name;
                document.getElementById('modalSummary').innerHTML = obj.summary || "No description.";
                document.getElementById('modalLink').href = obj.url || "#";
                modal.classList.remove('hidden');
            };

            card.querySelector('.bookmark-btn').onclick = (e) => {
                e.stopPropagation();
                const idx = savedItems.findIndex(i => i.name === obj.name);
                if (idx === -1) savedItems.push({ name: obj.name, mustWatch: false, url: obj.url });
                else savedItems.splice(idx, 1);
                localStorage.setItem('cinetrack_saves', JSON.stringify(savedItems));
                updateUI(); render(uniqueData);
            };
            grid.appendChild(card);
        });
    };

    document.getElementById('mustWatchToggle').onclick = () => {
        const name = document.getElementById('modalTitle').innerText;
        const url = document.getElementById('modalLink').href;
        let item = savedItems.find(i => i.name === name);
        if (item) item.mustWatch = !item.mustWatch;
        else savedItems.push({ name: name, mustWatch: true, url: url });
        localStorage.setItem('cinetrack_saves', JSON.stringify(savedItems));
        updateUI(); render(lastData); modal.classList.add('hidden');
    };

    async function fetchData(url, type) {
        const res = await fetch(url.replace("http:", "https:"));
        let data = await res.json();
        data.sort(() => Math.random() - 0.5);
        lastData = data; lastType = type;
        document.getElementById('mode-shows').className = `flex-1 py-2 rounded ${type === 'shows' ? 'bg-indigo-600' : 'bg-slate-700'}`;
        document.getElementById('mode-actors').className = `flex-1 py-2 rounded ${type === 'actors' ? 'bg-indigo-600' : 'bg-slate-700'}`;
        render(data);
    }

    document.getElementById('theme-toggle').onclick = () => document.body.classList.toggle('light-mode');
    document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
    document.getElementById('mode-shows').onclick = () => fetchData("https://api.tvmaze.com/schedule?country=US", 'shows');
    document.getElementById('mode-actors').onclick = () => fetchData("https://api.tvmaze.com/search/people?q=a", 'actors');
    document.getElementById('shuffle-btn').onclick = () => fetchData("https://api.tvmaze.com/schedule?country=US", 'shows');

    updateUI(); fetchData("https://api.tvmaze.com/schedule?country=US", 'shows');
});
document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("resultsGrid");
    const modal = document.getElementById('infoModal');
    const savedList = document.getElementById('saved-list');
    
    // Load as objects: { name, mustWatch }
    let savedItems = JSON.parse(localStorage.getItem('cinetrack_saves')) || [];

    const updateListUI = () => {
        savedList.innerHTML = savedItems.length === 0 ? '<li class="text-slate-500 italic">No items saved yet...</li>' : "";
        savedItems.forEach(item => {
            const li = document.createElement('li');
            li.className = "flex justify-between items-center text-indigo-400 font-bold truncate p-1";
            li.innerHTML = `
                <span>${item.mustWatch ? '🔥 ' : '★ '} ${item.name}</span>
                <button class="remove-btn text-xs bg-red-900/50 px-2 py-0.5 rounded hover:bg-red-600">✕</button>
            `;
            li.querySelector('.remove-btn').onclick = () => {
                savedItems = savedItems.filter(i => i.name !== item.name);
                localStorage.setItem('cinetrack_saves', JSON.stringify(savedItems));
                updateListUI();
                render(lastData, lastType);
            };
            savedList.appendChild(li);
        });
    };

    let lastData = [], lastType = 'shows';

    const render = (data, type) => {
        lastData = data; lastType = type;
        grid.innerHTML = "";
        data.slice(0, 9).forEach(item => {
            const obj = item.show || item.person;
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
                document.getElementById('modalSummary').innerHTML = obj.summary || "No description.";
                
                // Add "Must Watch" toggle to modal
                const modalFooter = document.getElementById('modalLink').parentElement;
                let toggleBtn = document.getElementById('mustWatchToggle');
                if(!toggleBtn) {
                    toggleBtn = document.createElement('button');
                    toggleBtn.id = 'mustWatchToggle';
                    toggleBtn.className = "w-full bg-orange-600 text-white py-3 rounded-lg font-bold mt-2";
                    modalFooter.insertBefore(toggleBtn, document.getElementById('modalLink'));
                }
                
                const isSaved = savedItems.find(i => i.name === obj.name);
                toggleBtn.innerText = isSaved?.mustWatch ? 'Remove from Must Watch' : 'Mark as Must Watch';
                toggleBtn.onclick = () => {
                    if (isSaved) {
                        isSaved.mustWatch = !isSaved.mustWatch;
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
                    savedItems.push({ name: obj.name, mustWatch: false });
                    localStorage.setItem('cinetrack_saves', JSON.stringify(savedItems));
                    updateListUI();
                    render(lastData, lastType);
                }
            };
            grid.appendChild(card);
        });
    };

    async function fetchData(url, type) {
        const res = await fetch(url.replace("http:", "https:"));
        render(await res.json(), type);
    }

    document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
    document.getElementById('mode-shows').onclick = () => fetchData("https://api.tvmaze.com/schedule?country=US", 'shows');
    document.getElementById('mode-actors').onclick = () => fetchData("https://api.tvmaze.com/search/people?q=a", 'actors');
    
    updateListUI();
    fetchData("https://api.tvmaze.com/schedule?country=US", 'shows');
});

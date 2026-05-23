const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const results = document.getElementById('results');
const status = document.getElementById('status');

searchBtn.addEventListener('click', async () => {
    const query = searchInput.value;
    if (!query) return;

    // Loading State
    status.textContent = "Loading...";
    results.innerHTML = "";

    try {
        const response = await fetch(`https://api.tvmaze.com/search/shows?q=${query}`);
        const data = await response.json();

        // Clear loading message
        status.textContent = "";

        // Empty state handling
        if (data.length === 0) {
            status.textContent = "No results found.";
            return;
        }

        // Render results
        data.forEach(item => {
            const show = item.show;
            const div = document.createElement('div');
            div.className = "bg-white p-4 shadow rounded border-l-4 border-blue-600";
            div.innerHTML = `
                <h2 class="font-bold text-lg">${show.name}</h2>
                <p class="text-sm text-gray-700">${show.summary ? show.summary.slice(0, 100) + '...' : 'No summary available.'}</p>
            `;
            results.appendChild(div);
        });
    } catch (error) {
        status.textContent = "Error fetching data. Please try again.";
    }
});

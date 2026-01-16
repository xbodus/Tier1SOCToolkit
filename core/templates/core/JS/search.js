// static/js/article-search.js
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const suggestionsBox = document.getElementById('search-suggestions');
    let debounceTimer;

    searchInput.addEventListener('input', function() {
        const query = this.value.trim();

        // Clear previous timer
        clearTimeout(debounceTimer);

        // Hide suggestions if query is too short
        if (query.length < 2) {
            suggestionsBox.classList.remove('open');
            // suggestionsBox.classList.add('hidden');
            return;
        }

        // Debounce - wait 300ms after user stops typing
        debounceTimer = setTimeout(() => {
            fetchSuggestions(query);
        }, 300);
    });

    function fetchSuggestions(query) {
        fetch(`api/articles/search?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                displaySuggestions(data.results);
            })
            .catch(error => {
                console.error('Search error:', error);
            });
    }

    function displaySuggestions(results) {
        if ('message' in results[0]) {
            let html = `
                    <div class="dropdown">
                        <h3 class="no-results">${results[0].message}</h3>
                            <ul class="suggestions-list">
            `;
            results[0].suggestions.forEach(article => {
                html += `
                    <li class="suggestion-item">
                        <a href="${article.url}">
                            <div class="suggestion-title">${article.title}</div>
                        </a>
                    </li>
                `;
            });
            html += '</ul></div>';

            suggestionsBox.innerHTML = html;

            suggestionsBox.classList.remove('hidden');
            suggestionsBox.classList.add('open');

            return
        }

        let html = '<div class="dropdown"> <ul class="suggestions-list">';
        results.forEach(article => {
            html += `
                <li class="suggestion-item">
                    <a href="${article.url}">
                        <div class="suggestion-title">${article.title}</div>
                        <div class="suggestion-meta">
                            ${article.category ? `<span class="category">${article.category}</span>` : ''}
                            ${article.difficulty ? `<span class="difficulty">${article.difficulty}</span>` : ''}
                            ${article.read_time ? `<span class="read-time">${article.read_time} min read</span>` : ''}
                        </div>
                        <div class="suggestion-excerpt">${article.excerpt}</div>
                    </a>
                </li>
            `;
        });
        html += '</ul></div>';

        suggestionsBox.innerHTML = html;
        suggestionsBox.classList.add('open');
        suggestionsBox.classList.remove('hidden');
    }

    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-container')) {
            suggestionsBox.classList.remove('open');
            suggestionsBox.classList.add('hidden');
        }
    });

    // Keyboard navigation (optional but nice)
    let selectedIndex = -1;
    searchInput.addEventListener('keydown', function(e) {
        const items = suggestionsBox.querySelectorAll('.suggestion-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection(items);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            items[selectedIndex].querySelector('a').click();
        }
    });

    function updateSelection(items) {
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }
});
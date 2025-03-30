// Search Input Debouncing
let searchTimeout;
const searchInput = document.querySelector('.search-input');
const searchResults = document.querySelector('.search-results');
const searchSpinner = document.querySelector('.search-spinner');

if (searchInput && searchResults) {
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();

        if (query.length < 2) {
            searchResults.classList.add('d-none');
            return;
        }

        searchSpinner.classList.remove('d-none');
        searchResults.classList.remove('d-none');

        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 500);
    });

    // Close search results on outside click
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('d-none');
        }
    });
}

// Perform Search
async function performSearch(query) {
    try {
        const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.success) {
            displaySearchResults(data.results);
        } else {
            showSearchError(data.message || 'Search failed. Please try again.');
        }
    } catch (error) {
        showSearchError('An error occurred. Please try again later.');
    } finally {
        searchSpinner.classList.add('d-none');
    }
}

// Display Search Results
function displaySearchResults(results) {
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="search-no-results">
                <i class="fas fa-search"></i>
                <p>No results found</p>
            </div>
        `;
        return;
    }

    const resultsHTML = results.map(result => `
        <div class="search-result-item">
            <div class="result-header">
                <img src="${result.author.avatar || '/images/default-avatar.png'}" 
                     alt="${result.author.name}" 
                     class="avatar">
                <div class="result-info">
                    <h5>${result.author.name}</h5>
                    <small>${new Date(result.createdAt).toLocaleString()}</small>
                </div>
            </div>
            <h4>${highlightMatch(result.title, searchInput.value)}</h4>
            <p>${highlightMatch(result.content.substring(0, 150) + '...', searchInput.value)}</p>
            <a href="/posts/${result._id}" class="btn btn-sm btn-primary">Read More</a>
        </div>
    `).join('');

    searchResults.innerHTML = resultsHTML;
}

// Highlight Matching Text
function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Show Search Error
function showSearchError(message) {
    searchResults.innerHTML = `
        <div class="search-error">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

// Advanced Search Filters
const filterForm = document.querySelector('.search-filters');
if (filterForm) {
    const filterInputs = filterForm.querySelectorAll('input, select');
    
    filterInputs.forEach(input => {
        input.addEventListener('change', function() {
            const formData = new FormData(filterForm);
            const params = new URLSearchParams(formData);
            
            window.location.href = `/search?${params.toString()}`;
        });
    });
}

// Search History
const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
const maxHistoryItems = 5;

function addToSearchHistory(query) {
    if (!query) return;
    
    const index = searchHistory.indexOf(query);
    if (index > -1) {
        searchHistory.splice(index, 1);
    }
    
    searchHistory.unshift(query);
    if (searchHistory.length > maxHistoryItems) {
        searchHistory.pop();
    }
    
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    updateSearchHistory();
}

function updateSearchHistory() {
    const historyContainer = document.querySelector('.search-history');
    if (!historyContainer) return;

    if (searchHistory.length === 0) {
        historyContainer.innerHTML = '<p>No search history</p>';
        return;
    }

    const historyHTML = searchHistory.map(query => `
        <div class="history-item">
            <i class="fas fa-history"></i>
            <span>${query}</span>
        </div>
    `).join('');

    historyContainer.innerHTML = historyHTML;
}

// Clear Search History
const clearHistoryBtn = document.querySelector('.clear-history-btn');
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', function() {
        localStorage.removeItem('searchHistory');
        updateSearchHistory();
    });
}

// Initialize Search History
updateSearchHistory(); 
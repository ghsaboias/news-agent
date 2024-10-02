const API_BASE_URL = 'http://127.0.0.1:5000';

function fetchNews(endpoint, containerId, loadingId, errorId, pageId, prevId, nextId) {
    let currentPage = 1;
    let totalPages = 1;

    function updatePagination() {
        document.getElementById(pageId).textContent = `Page ${currentPage} of ${totalPages}`;
        document.getElementById(prevId).disabled = currentPage === 1;
        document.getElementById(nextId).disabled = currentPage === totalPages;
    }

    function loadPage(page) {
        const container = document.getElementById(containerId);
        const loadingElement = document.getElementById(loadingId);
        const errorElement = document.getElementById(errorId);

        loadingElement.style.display = 'block';
        errorElement.style.display = 'none';
        container.innerHTML = '';

        fetch(`${API_BASE_URL}${endpoint}?page=${page}`)
            .then(response => response.json())
            .then(data => {
                loadingElement.style.display = 'none';
                data.articles.forEach(article => {
                    const articleElement = createArticleElement(article);
                    container.appendChild(articleElement);
                });
                currentPage = data.currentPage;
                totalPages = data.totalPages;
                updatePagination();
            })
            .catch(error => {
                loadingElement.style.display = 'none';
                errorElement.textContent = `Error fetching news: ${error.message}`;
                errorElement.style.display = 'block';
                console.error('Error:', error);
            });
    }

    document.getElementById(prevId).addEventListener('click', () => {
        if (currentPage > 1) {
            loadPage(currentPage - 1);
        }
    });

    document.getElementById(nextId).addEventListener('click', () => {
        if (currentPage < totalPages) {
            loadPage(currentPage + 1);
        }
    });

    loadPage(1);
}

function createArticleElement(article) {
    const articleElement = document.createElement('div');
    articleElement.className = 'article';

    articleElement.innerHTML = `
        <h3>${article.title}</h3>
        ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}">` : ''}
        <p class="article-meta">
            <span>${article.source.name}</span> | 
            <span>${new Date(article.publishedAt).toLocaleString()}</span>
        </p>
        <p>${article.description}</p>
        <a href="${article.url}" target="_blank">Read more</a>
        <div class="ai-analysis">
            <h4>AI Analysis:</h4>
            <p>${article.ai_analysis}</p>
        </div>
    `;

    return articleElement;
}

// Toggle functionality
function setupToggle() {
    const topHeadlinesButton = document.getElementById('toggle-top-headlines');
    const everythingButton = document.getElementById('toggle-everything');
    const topHeadlinesSection = document.getElementById('top-headlines-section');
    const everythingSection = document.getElementById('everything-section');

    topHeadlinesButton.addEventListener('click', () => {
        topHeadlinesButton.classList.add('active');
        everythingButton.classList.remove('active');
        topHeadlinesSection.style.display = 'block';
        everythingSection.style.display = 'none';
    });

    everythingButton.addEventListener('click', () => {
        everythingButton.classList.add('active');
        topHeadlinesButton.classList.remove('active');
        everythingSection.style.display = 'block';
        topHeadlinesSection.style.display = 'none';
    });
}

// Fetch news on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchNews('/api/top-headlines', 'top-headlines', 'top-headlines-loading', 'top-headlines-error', 'top-headlines-page', 'top-headlines-prev', 'top-headlines-next');
    fetchNews('/api/everything', 'everything', 'everything-loading', 'everything-error', 'everything-page', 'everything-prev', 'everything-next');
    setupToggle();
});
// กำหนดหมวดหมู่ทั้งหมดพร้อมชื่อเต็ม (ใช้ในการแสดงหัวข้อ)
const CATEGORIES_FULL_NAME = {
    'new': 'หนังใหม่',
    'thai': 'หนังไทย',
    'korea': 'หนังเกาหลี',
    'china': 'หนังจีน/ฮ่องกง',
    'inter': 'หนังฝรั่ง/สากล',
    'cartoon': 'การ์ตูน/อนิเมชั่น',
    'india': 'หนังอินเดีย',
    'asia': 'หนังเอเซีย',
    'laconcin': 'ละครจีน'
};

const ITEMS_PER_PAGE = 48; 
let allMovies = [];      
let currentPage = 1;     
let currentCategory = '';  

// --- [ COMMON FUNCTIONS ] ---
function createMovieCard(movie) {
    const moviePlayer = movie.player || 'watch';
    const movieFile = movie.file || movie.url || movie.video;
    const movieName = movie.name || '';
    const movieSubtitle = movie.subtitle; 

    let watchUrl = `${moviePlayer}.html?file=${encodeURIComponent(movieFile || '')}&name=${encodeURIComponent(movieName)}`;
    if (movieSubtitle && movieSubtitle.trim() !== '') {
        watchUrl += `&subtitle=${encodeURIComponent(movieSubtitle)}`;
    }

    return `
        <div class="flex-shrink-0 w-[150px] bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-red-500/30 transition duration-300 poster-card group cursor-pointer">
            <div class="relative">
                <a href="${watchUrl}">
                    <img src="${movie.logo || movie.image || movie.poster}"
                         onerror="this.onerror=null;this.src='https://via.placeholder.com/150x225?text=No+Image';"
                         alt="${movie.name}"
                         class="w-full h-[225px] object-cover transition duration-500">
                </a>
            </div>
            <div class="p-2">
                <p class="text-sm font-semibold truncate" title="${movie.name}">${movie.name}</p>
                <p class="text-xs text-gray-400">${movie.info}</p>
            </div>
        </div>
    `;
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// --- [ PAGINATION LOGIC ] ---
function renderPagination(totalItems, totalPages) {
    const paginationContainer = document.getElementById('pagination-container');
    let paginationHtml = '';

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    paginationHtml += '<nav class="flex justify-center space-x-2">';
    
    const prevDisabled = (currentPage === 1) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700';
    paginationHtml += `<button onclick="changePage(${currentPage - 1})" class="py-2 px-4 rounded-lg bg-blue-600 ${prevDisabled}" ${currentPage === 1 ? 'disabled' : ''}>« ก่อนหน้า</button>`;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        paginationHtml += `<button onclick="changePage(1)" class="py-2 px-4 rounded-lg bg-gray-700 hover:bg-blue-700">1</button>`;
        if (startPage > 2) paginationHtml += `<span class="py-2 px-1 text-gray-400">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        const activeClass = (i === currentPage) ? 'bg-blue-800' : 'bg-gray-700 hover:bg-blue-700';
        paginationHtml += `<button onclick="changePage(${i})" class="py-2 px-4 rounded-lg ${activeClass}">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) paginationHtml += `<span class="py-2 px-1 text-gray-400">...</span>`;
        paginationHtml += `<button onclick="changePage(${totalPages})" class="py-2 px-4 rounded-lg bg-gray-700 hover:bg-blue-700">${totalPages}</button>`;
    }

    const nextDisabled = (currentPage === totalPages) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700';
    paginationHtml += `<button onclick="changePage(${currentPage + 1})" class="py-2 px-4 rounded-lg bg-blue-600 ${nextDisabled}" ${currentPage === totalPages ? 'disabled' : ''}>ถัดไป »</button>`;
    
    paginationHtml += '</nav>';
    paginationContainer.innerHTML = paginationHtml;
}

function displayMovies(moviesToDisplay, title) {
    const listContainer = document.getElementById('movie-list-grid');
    const titleElement = document.getElementById('category-title');
    
    const totalItems = moviesToDisplay.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
    
    const limitedMovies = moviesToDisplay.slice(startIndex, endIndex);

    if (limitedMovies && limitedMovies.length > 0) {
        const cardsHtml = limitedMovies.map(createMovieCard).join('');
        listContainer.innerHTML = cardsHtml;
        
        titleElement.textContent = `${title} (หน้า ${currentPage}/${totalPages} | รวม ${totalItems} รายการ)`;
    } else {
        listContainer.innerHTML = `<p class="text-blue-500 col-span-full">ไม่พบรายการหนัง!</p>`;
        titleElement.textContent = `${title} (0 รายการ)`;
    }

    renderPagination(totalItems, totalPages);
}

function changePage(newPage) {
    const totalPages = Math.ceil(allMovies.length / ITEMS_PER_PAGE);
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        document.getElementById('search-input').value = '';
        displayMovies(allMovies, CATEGORIES_FULL_NAME[currentCategory]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// --- [ LOAD CATEGORY LOGIC ] ---
async function loadCategory(categoryKey) {
    currentCategory = categoryKey;
    currentPage = 1; 
    const listContainer = document.getElementById('movie-list-grid');
    listContainer.innerHTML = '<p class="text-gray-400 col-span-full">กำลังโหลดรายการ...</p>';
    document.getElementById('pagination-container').innerHTML = '';
    document.getElementById('search-input').value = '';

    let movies = [];
    try {
        // ✅ ใช้ JSON-Parser.html พร้อม mode=json สำหรับทุก category
        const parserUrl = `./JSON-Parser.html?file=m3u/${categoryKey}.txt&mode=json`;
        const response = await fetch(parserUrl);
        if (!response.ok) throw new Error(`Failed to load: ${parserUrl}`);
        movies = await response.json();
    } catch (error) {
        console.error(`Error loading JSON for ${categoryKey}:`, error);
        document.getElementById('category-title').textContent = CATEGORIES_FULL_NAME[categoryKey] || 'รายการหนัง';
        listContainer.innerHTML = `<p class="text-blue-500 col-span-full">❌ เกิดข้อผิดพลาดในการโหลดรายการ **${CATEGORIES_FULL_NAME[categoryKey]}** หรือไม่พบไฟล์</p>`;
        return; 
    }
    
    allMovies = movies;
    
    const categoryButtons = document.querySelectorAll('#main-nav a[data-category]');
    categoryButtons.forEach(a => {
        a.classList.remove('bg-blue-600', 'text-white');
        a.classList.add('hover:bg-gray-700');
        if (a.getAttribute('data-category') === categoryKey) {
            a.classList.add('bg-blue-600', 'text-white');
            a.classList.remove('hover:bg-gray-700');
        }
    });

    displayMovies(allMovies, CATEGORIES_FULL_NAME[categoryKey]);
}

function searchMovies() {
    const query = document.getElementById('search-input').value.toLowerCase();
    
    if (!query) {
        currentPage = 1;
        displayMovies(allMovies, CATEGORIES_FULL_NAME[currentCategory]);
        return;
    }
    
    const filteredMovies = allMovies.filter(movie => {
        const name = (movie.name || '').toLowerCase();
        const info = (movie.info || '').toLowerCase();
        return name.includes(query) || info.includes(query);
    });
    
    currentPage = 1; 
    displayMovies(filteredMovies, `ผลการค้นหา "${query}" ใน ${CATEGORIES_FULL_NAME[currentCategory]}`);
}

document.addEventListener('DOMContentLoaded', () => {
    const categoryKey = getQueryParam('cat');
    if (categoryKey && CATEGORIES_FULL_NAME[categoryKey]) {
        loadCategory(categoryKey);
    } else {
        loadCategory('new');
    }
});

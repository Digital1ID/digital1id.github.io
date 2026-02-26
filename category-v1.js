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
    'laconcin': 'ละครจีน',
    'new2': 'หนัง'
};

const ITEMS_PER_PAGE = 48; 
let allMovies = [];      
let currentPage = 1;     
let currentCategory = '';  

// --- [ COMMON FUNCTIONS ] ---
function createMovieCard(movie, index = 0) {
    const moviePlayer = movie.player || 'watch';
    const movieName = movie.nameTH || movie.nameEN || movie.name || '';
    const movieSeason = movie.season || '1';
    const movieFile = movie.file || movie.url || movie.video;
    const movieSubtitle = movie.subtitle;

    let watchUrl = `${moviePlayer}.html?file=${encodeURIComponent(movieFile || '')}&season=${encodeURIComponent(movieSeason)}&name=${encodeURIComponent(movieName)}`;
    if (movieSubtitle && movieSubtitle.trim() !== '') {
        watchUrl += `&subtitle=${encodeURIComponent(movieSubtitle)}`;
    }

    const soundText = movie.info?.sound || (typeof movie.info === 'string' ? movie.info : '');
    const subtitleText = movie.info?.subtitles || '';
    const posterUrl = movie.logo || movie.image || movie.poster || (typeof movie.info === 'object' ? movie.info.poster : null);

    return `
        <div class="flex-shrink-0 w-[150px] bg-gray-800 rounded-xl overflow-hidden shadow-lg 
                    hover:shadow-red-500/30 transition duration-300 poster-card group cursor-pointer 
                    opacity-0 animate-fadeIn" 
             style="animation-delay:${index * 0.05}s">
          <a href="${watchUrl}">
            <div class="relative">
              <img src="${posterUrl || '/images/no-image.jpg.svg'}"
                   onerror="this.onerror=null;this.src='/images/no-image.jpg.svg';"
                   alt="${movieName}"
                   class="w-full h-[225px] object-cover transition duration-500 group-hover:opacity-90">
              <div class="absolute top-1 right-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow-md border border-blue-400/30">
                ${soundText}
              </div>
            </div>
            <div class="p-2">
              <p class="text-sm font-semibold truncate" title="${movieName}">${movieName}</p>
              <p class="text-xs text-gray-400">เสียงภาษา : ${soundText}</p>
              <p class="text-xs text-gray-400">ซับไตเติล : ${subtitleText || 'ไม่มี'}</p>
            </div>
          </a>
        </div>
    `;
}

// --- [ PAGINATION LOGIC ] ---
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

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
        const activeClass = (i === currentPage) ? 'bg-blue-800 text-white shadow-md' : 'bg-gray-700 hover:bg-blue-700';
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
        const cardsHtml = limitedMovies.map((movie, i) => createMovieCard(movie, i)).join('');
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

async function loadCategory(categoryKey) {
    currentCategory = categoryKey;
    currentPage = 1; 
    const listContainer = document.getElementById('movie-list-grid');
    listContainer.innerHTML = '<p class="text-gray-400 col-span-full">กำลังโหลดรายการ...</p>';
    document.getElementById('pagination-container').innerHTML = '';
    document.getElementById('search-input').value = '';

    let movies = [];
    try {
        const response = await fetch(`./playlist/${categoryKey}.json`); 
        if (!response.ok) throw new Error(`Failed to load: ./playlist/${categoryKey}.json`);
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

        let infoText = '';
        if (typeof movie.info === 'string') {
            infoText = movie.info.toLowerCase();
        } else if (typeof movie.info === 'object' && movie.info !== null) {
            const sound = movie.info.sound || '';
            const subtitles = movie.info.subtitles || '';
            const description = movie.info.description || '';
            infoText = `${sound} ${subtitles} ${description}`.toLowerCase();
        }

        return name.includes(query) || infoText.includes(query);
    });
    
    currentPage = 1; 
    displayMovies(filteredMovies, `ผลการค้นหา "${query}" ใน ${CATEGORIES_FULL_NAME[currentCategory]}`);
}

// โหลดรายการตามพารามิเตอร์เมื่อหน้าเว็บโหลดเสร็จ
document.addEventListener('DOMContentLoaded', () => {
    const categoryKey = getQueryParam('cat');
    if (categoryKey && CATEGORIES_FULL_NAME[categoryKey]) {
        loadCategory(categoryKey);
    } else {
        loadCategory('thai'); // ค่าเริ่มต้น
    }
});
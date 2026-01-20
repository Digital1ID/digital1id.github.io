// กำหนดหมวดหมู่ทั้งหมดที่คุณต้องการแสดงบนหน้าแรก
const CATEGORIES = [
    { key: 'new', title: 'หนังใหม่' },
    { key: 'thai', title: 'หนังไทย' },
    { key: 'korea', title: 'หนังเกาหลี' },
    { key: 'china', title: 'หนังจีน/ฮ่องกง' },
    { key: 'inter', title: 'หนังฝรั่ง/สากล' },
    { key: 'cartoon', title: 'การ์ตูน/อนิเมชั่น' },
    { key: 'india', title: 'หนังอินเดีย' },
    { key: 'asia', title: 'หนังเอเซีย' },
    { key: 'laconcin', title: 'ละครจีน' }
];

const ITEMS_PER_ROW = 16; 
let allMoviesByTitle = {}; 
let originalSectionsHtml = ''; // เก็บ HTML หน้าหลักเดิม

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

    let soundText = '';
    let subtitleText = '';
    if (typeof movie.info === 'object' && movie.info !== null) {
        soundText = movie.info.sound || '';
        subtitleText = movie.info.subtitles || '';
    } else if (typeof movie.info === 'string') {
        soundText = movie.info;
    }

    return `
        <div class="flex-shrink-0 w-[150px] bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-blue-500/30 transition duration-300 poster-card group cursor-pointer">
            <div class="relative">
                <a href="${watchUrl}">
                    <img src="${movie.logo || movie.image || movie.poster}"
                         onerror="this.onerror=null;this.src='https://via.placeholder.com/150x225?text=No+Image';"
                         alt="${movieName}"
                         class="w-full h-[225px] object-cover transition duration-500">
                </a>
            </div>
            <div class="p-2">
                <p class="text-sm font-semibold truncate" title="${movieName}">${movieName}</p>
                <p class="text-xs text-gray-400">เสียงภาษา : ${soundText}</p>
                <p class="text-xs text-gray-400">คำบรรยาย : ${subtitleText}</p>
            </div>
        </div>
    `;
}

// --- [ INDEX.HTML LOGIC ] ---

function createMovieSection(title, movies, categoryKey, isSearch = false) {
    const limit = isSearch ? movies.length : ITEMS_PER_ROW;
    const limitedMovies = movies.slice(0, limit);
    const cardsHtml = limitedMovies.map(createMovieCard).join(''); 
    
    const categoryUrl = `category.html?cat=${categoryKey}`;
    
    return `
        <section class="mb-10">
            <a href="${categoryUrl}" class="group block mb-6">
                <h3 class="text-3xl font-bold border-l-4 border-red-600 pl-3 transition duration-300 group-hover:text-red-500">
                    ${title} 
                    <span class="text-red-600 text-xl ml-2 group-hover:ml-3 transition-all duration-300">›</span>
                </h3>
            </a>
            
            <div class="horizontal-scroll-container flex space-x-2 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                ${cardsHtml}
            </div>
        </section>
    `;
}

async function loadAllMovies() {
    const container = document.getElementById('movie-sections-container');
    const searchResultContainer = document.getElementById('search-result-container');
    
    searchResultContainer.innerHTML = '';
    searchResultContainer.style.display = 'none'; 
    container.style.display = 'block';

    container.innerHTML = '<p class="text-gray-400">กำลังโหลดรายการหนังทั้งหมด...</p>';
    let allSectionsHtml = '';
    allMoviesByTitle = {};
    
    for (const category of CATEGORIES) {
        let movies = [];
        try {
            const response = await fetch(`./playlist/${category.key}.json`); 
            if (!response.ok) {
                console.warn(`Skipping category ${category.key}: File not found or failed to load.`);
                continue; 
            }
            movies = await response.json();
        } catch (error) {
            console.error(`Error loading JSON for ${category.key}:`, error);
            continue; 
        }
        
        if (movies && movies.length > 0) {
            allSectionsHtml += createMovieSection(category.title, movies, category.key); 
            
            movies.forEach(movie => {
                const nameKey = (movie.name || '').toLowerCase();
                if (!allMoviesByTitle[nameKey]) {
                    allMoviesByTitle[nameKey] = movie; 
                }
            });
        }
    }

    if (allSectionsHtml) {
        container.innerHTML = allSectionsHtml;
        originalSectionsHtml = allSectionsHtml;
    } else {
        container.innerHTML = '<p class="text-blue-500">ไม่พบรายการหนังในทุกหมวดหมู่. โปรดตรวจสอบไฟล์ JSON ในโฟลเดอร์ **playlist/**</p>';
        originalSectionsHtml = '';
    }
}

// --- [ SEARCH LOGIC FIXED ] ---

function searchMovies() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const container = document.getElementById('movie-sections-container');
    const searchResultContainer = document.getElementById('search-result-container');

    if (!query || query.length < 2) {
        searchResultContainer.innerHTML = '';
        searchResultContainer.style.display = 'none';
        container.style.display = 'block';
        if (originalSectionsHtml) {
             container.innerHTML = originalSectionsHtml;
        } else {
             loadAllMovies();
        }
        return;
    }
    
    container.style.display = 'none';
    searchResultContainer.style.display = 'block';
    
    const allMoviesArray = Object.values(allMoviesByTitle);
    
    const filteredMovies = allMoviesArray.filter(movie => {
        const name = (movie.name || '').toLowerCase();
        
        let infoText = '';
        if (typeof movie.info === 'object' && movie.info !== null) {
            infoText = `${movie.info.sound || ''} ${movie.info.subtitles || ''}`.toLowerCase();
        } else if (typeof movie.info === 'string') {
            infoText = movie.info.toLowerCase();
        }

        return name.includes(query) || infoText.includes(query);
    });

    if (filteredMovies.length > 0) {
        const searchTitle = `🔍 ผลการค้นหา "${document.getElementById('search-input').value}" (${filteredMovies.length} รายการ)`;
        const searchSection = createMovieSection(searchTitle, filteredMovies, 'search', true);
        searchResultContainer.innerHTML = searchSection;
    } else {
        searchResultContainer.innerHTML = `<p class="text-blue-500 text-2xl mt-8">ไม่พบรายการหนังที่ตรงกับ "${document.getElementById('search-input').value}"</p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.title.includes('หน้าหลัก')) {
        loadAllMovies(); 
    }
});
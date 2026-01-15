let allMovies = [];
let allMoviesByTitle = {};
let originalSectionsHtml = '';

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
                <p class="text-xs text-gray-400">${movie.info || ''}</p>
            </div>
        </div>
    `;
}

function createMovieSection(title, movies) {
    const cardsHtml = movies.map(createMovieCard).join('');
    return `
        <section class="mb-10">
            <h3 class="text-3xl font-bold border-l-4 border-red-600 pl-3 mb-6">${title}</h3>
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

    try {
        // ✅ โหลดจาก Parser เพียงครั้งเดียว
        const response = await fetch(`./JSON-Parser.html?file=m3u/movie/new.txt&mode=json`);
        if (!response.ok) throw new Error("ไม่สามารถโหลดข้อมูลจาก Parser ได้");
        allMovies = await response.json();
    } catch (error) {
        console.error("Error loading movies:", error);
        container.innerHTML = '<p class="text-blue-500">❌ เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
        return;
    }

    // ✅ สร้าง CATEGORIES จากค่า group
    const groups = [...new Set(allMovies.map(m => m.group || 'อื่นๆ'))];

    for (const group of groups) {
        const moviesInGroup = allMovies.filter(m => (m.group || 'อื่นๆ') === group);
        if (moviesInGroup.length > 0) {
            allSectionsHtml += createMovieSection(group, moviesInGroup);
            moviesInGroup.forEach(movie => {
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
        container.innerHTML = '<p class="text-blue-500">ไม่พบรายการหนัง</p>';
        originalSectionsHtml = '';
    }
}

function searchMovies() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const container = document.getElementById('movie-sections-container');
    const searchResultContainer = document.getElementById('search-result-container');

    if (!query || query.length < 2) {
        searchResultContainer.innerHTML = '';
        searchResultContainer.style.display = 'none';
        container.style.display = 'block';
        container.innerHTML = originalSectionsHtml || '';
        return;
    }

    container.style.display = 'none';
    searchResultContainer.style.display = 'block';

    const filteredMovies = Object.values(allMoviesByTitle).filter(movie => {
        const name = (movie.name || '').toLowerCase();
        const info = (movie.info || '').toLowerCase();
        return name.includes(query) || info.includes(query);
    });

    if (filteredMovies.length > 0) {
        const searchTitle = `🔍 ผลการค้นหา "${document.getElementById('search-input').value}" (${filteredMovies.length} รายการ)`;
        const searchSection = createMovieSection(searchTitle, filteredMovies);
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

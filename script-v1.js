// =============================
// 🎬 CONFIG
// =============================
const CATEGORIES = [
    { key: 'new', title: 'หนังใหม่' },
    { key: 'thai', title: 'หนังไทย' },
    { key: 'korea', title: 'หนังเกาหลี' },
    { key: 'china', title: 'หนังจีน/ฮ่องกง' },
    { key: 'inter', title: 'หนังฝรั่ง/สากล' },
    { key: 'cartoon', title: 'การ์ตูน/อนิเมชั่น' },
    { key: 'india', title: 'หนังอินเดีย' },
    { key: 'asia', title: 'หนังเอเซีย' },
    { key: 'laconcin', title: 'ละครจีน' },
    { key: 'new2', title: 'หนัง' }
];

const ITEMS_PER_ROW = 16;
let allMoviesByTitle = {};
let originalSectionsHtml = '';


// =============================
// 🎬 CREATE MOVIE CARD
// =============================
function createMovieCard(movie, index = 0) {

  const movieName = movie.name || '';
  const categoryKey = movie.categoryKey || '';

  // ✅ ส่ง categoryKey ไป player แทน video url
  let watchUrl = `player.html?file=${encodeURIComponent(categoryKey)}&name=${encodeURIComponent(movieName)}`;

  const soundText = movie.info?.sound || (typeof movie.info === 'string' ? movie.info : '');
  const subtitleText = movie.info?.subtitles || '';
  const posterUrl =
      movie.logo ||
      movie.image ||
      movie.poster ||
      (typeof movie.info === 'object' ? movie.info.poster : null);

  return `
    <div class="flex-shrink-0 w-[150px] bg-gray-800 rounded-xl overflow-hidden shadow-lg 
                hover:shadow-blue-500/30 transition duration-300 group cursor-pointer 
                transform hover:scale-105 opacity-0 animate-fadeIn"
         style="animation-delay:${index * 0.1}s">

      <a href="${watchUrl}">
        <div class="relative">
          <img src="${posterUrl || '/images/no-image.jpg.svg'}"
               onerror="this.onerror=null;this.src='/images/no-image.jpg.svg';"
               alt="${movieName}"
               class="w-full h-[225px] object-cover transition duration-500 group-hover:opacity-90">

          <div class="absolute top-1 right-1 bg-gradient-to-r from-blue-600 to-blue-500 
                      text-white text-xs px-2 py-1 rounded-md font-medium shadow-md 
                      border border-blue-400/30">
            ${soundText}
          </div>
        </div>

        <div class="p-2">
          <p class="text-sm font-semibold truncate" title="${movieName}">
            ${movieName}
          </p>
          <p class="text-xs text-gray-400">
            เสียงภาษา : ${soundText}
          </p>
          <p class="text-xs text-gray-400">
            ซับไตเติล : ${subtitleText || 'ไม่มี'}
          </p>
        </div>
      </a>
    </div>
  `;
}


// =============================
// 🎬 CREATE SECTION
// =============================
function createMovieSection(title, movies, categoryKey, isSearch = false) {

  const limit = isSearch ? movies.length : ITEMS_PER_ROW;
  const limitedMovies = movies.slice(0, limit);
  const cardsHtml = limitedMovies.map((movie, i) => createMovieCard(movie, i)).join('');
  const categoryUrl = `category.html?cat=${categoryKey}`;

  if (isSearch) {
    return `
      <section class="mb-10">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold border-l-4 border-red-600 pl-3">
            ${title}
          </h3>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 
                    lg:grid-cols-6 gap-4">
          ${cardsHtml}
        </div>
      </section>
    `;
  }

  return `
    <section class="mb-10 relative">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-3xl font-bold border-l-4 border-red-600 pl-3">
          ${title}
        </h3>

        <a href="${categoryUrl}" 
           class="text-red-600 font-semibold hover:text-red-400 transition">
          ดูทั้งหมด ›
        </a>
      </div>

      <div class="movie-row flex space-x-2 overflow-x-auto 
                  scrollbar-hide pb-4 px-4 snap-x snap-mandatory scroll-smooth">
        ${cardsHtml}
      </div>
    </section>
  `;
}


// =============================
// 🎬 LOAD ALL MOVIES
// =============================
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
      if (!response.ok) continue;

      movies = await response.json();

      // ✅ เพิ่ม categoryKey เข้า movie ทุกตัว
      movies = movies.map(m => ({
        ...m,
        categoryKey: category.key
      }));

    } catch (error) {
      console.error(`Error loading ${category.key}:`, error);
      continue;
    }

    if (movies && movies.length > 0) {

      allSectionsHtml += createMovieSection(
        category.title,
        movies,
        category.key
      );

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
    container.innerHTML =
      '<p class="text-blue-500">ไม่พบรายการหนังในระบบ</p>';
    originalSectionsHtml = '';
  }
}


// =============================
// 🔍 SEARCH
// =============================
function searchMovies() {

  const query = document.getElementById('search-input').value.toLowerCase();
  const container = document.getElementById('movie-sections-container');
  const searchResultContainer = document.getElementById('search-result-container');

  if (!query || query.length < 2) {
    searchResultContainer.innerHTML = '';
    searchResultContainer.style.display = 'none';
    container.style.display = 'block';
    container.innerHTML = originalSectionsHtml;
    return;
  }

  container.style.display = 'none';
  searchResultContainer.style.display = 'block';

  const allMoviesArray = Object.values(allMoviesByTitle);

  const filteredMovies = allMoviesArray.filter(movie => {

    const name = (movie.name || '').toLowerCase();
    const description = movie.info?.plot?.toLowerCase() || '';
    const sound = movie.info?.sound?.toLowerCase() || '';
    const subtitles = movie.info?.subtitles?.toLowerCase() || '';

    const searchText = `${name} ${description} ${sound} ${subtitles}`;
    return searchText.includes(query);
  });

  if (filteredMovies.length > 0) {

    const searchTitle =
      `🔍 ผลการค้นหา "${document.getElementById('search-input').value}" (${filteredMovies.length} รายการ)`;

    const searchSection =
      createMovieSection(searchTitle, filteredMovies, 'search', true);

    searchResultContainer.innerHTML = searchSection;

  } else {

    searchResultContainer.innerHTML =
      `<p class="text-blue-500 text-2xl mt-8">
        ไม่พบรายการหนังที่ตรงกับ "${document.getElementById('search-input').value}"
      </p>`;
  }
}


// =============================
// 🚀 INIT
// =============================
document.addEventListener('DOMContentLoaded', () => {
  loadAllMovies();
});
// ============================
// GLOBAL
// ============================
let autoRefreshInterval = null;
let isPlayerActive = false;
let currentStreamUrl = null;
let allMatches = [];
let hlsInstance = null;

// ============================
// FORMAT STATUS
// ============================
function formatStatus(status) {
  if (!status) return "";

  const s = status.trim().toUpperCase();

  if (s === "-") {
    return `<span class="bg-red-600 px-2 py-1 rounded text-xs font-bold animate-pulse">LIVE</span>`;
  }

  if (s === "FT") {
    return `<span class="text-gray-400 font-semibold">FT</span>`;
  }

  if (/^\d{1,2}:\d{2}$/.test(s)) {
    return `<span class="text-yellow-400 font-medium">${s}</span>`;
  }

  return s;
}

// ============================
// PLAY STREAM
// ============================
function playStream(url) {
  if (!url) return;

  const video = document.getElementById("videoPlayer");
  const playerBox = document.getElementById("playerBox");

  if (currentStreamUrl === url) return;

  currentStreamUrl = url;
  isPlayerActive = true;

  playerBox.classList.add("active");

  if (hlsInstance) {
    hlsInstance.destroy();
  }

  if (Hls.isSupported()) {
    hlsInstance = new Hls();
    hlsInstance.loadSource(url);
    hlsInstance.attachMedia(video);
  } else {
    video.src = url;
  }

  video.play();
}

// ============================
// LOAD DATA
// ============================
async function parseMatches() {
  try {
    const response = await fetch("matches.json?_=" + new Date().getTime());
    const data = await response.json();

    allMatches = data;

    renderLeagueOptions();
    renderTable(allMatches);

  } catch (err) {
    console.error("โหลดข้อมูลไม่สำเร็จ:", err);
  }
}

// ============================
// RENDER LEAGUE FILTER
// ============================
function renderLeagueOptions() {
  const select = document.getElementById("leagueSelect");

  const leagues = [...new Set(allMatches.map(m => m.league))];

  select.innerHTML = `<option value="all">ทุกลีก</option>`;

  leagues.forEach(league => {
    select.innerHTML += `<option value="${league}">${league}</option>`;
  });
}

// ============================
// RENDER TABLE
// ============================
function renderTable(matches) {
  const tbody = document.querySelector("#matchesTable tbody");
  tbody.innerHTML = "";

  matches.forEach(match => {
    const tr = document.createElement("tr");
    tr.className = "border-b border-gray-800 hover:bg-[#1f1f1f]";

    tr.innerHTML = `
      <td class="py-2 px-3">${match.home}</td>
      <td class="py-2 px-3">${match.away}</td>
      <td class="py-2 px-3">${match.datetime}</td>
      <td class="py-2 px-3">${formatStatus(match.status)}</td>
      <td class="py-2 px-3">${match.channel || "-"}</td>
      <td class="py-2 px-3">
        <button onclick="playStream('${match.stream}')"
          class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm">
          ▶ ดูสด
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ============================
// FILTER FUNCTION
// ============================
function filterTable() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const selectedLeague = document.getElementById("leagueSelect").value;

  let filtered = allMatches.filter(m =>
    m.home.toLowerCase().includes(keyword) ||
    m.away.toLowerCase().includes(keyword)
  );

  if (selectedLeague !== "all") {
    filtered = filtered.filter(m => m.league === selectedLeague);
  }

  renderTable(filtered);
}

// ============================
// AUTO REFRESH
// ============================
function startAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }

  autoRefreshInterval = setInterval(async () => {
    console.log("🔄 Auto Refresh...");

    const oldData = JSON.stringify(allMatches);

    await parseMatches();

    const newData = JSON.stringify(allMatches);

    if (oldData !== newData) {
      console.log("📢 มีข้อมูลใหม่");
    }

  }, 60000);
}

// ============================
// INIT
// ============================
document.addEventListener("DOMContentLoaded", () => {

  parseMatches();
  startAutoRefresh();

  document.getElementById("searchInput")
    .addEventListener("keyup", filterTable);

  document.getElementById("leagueSelect")
    .addEventListener("change", filterTable);

});
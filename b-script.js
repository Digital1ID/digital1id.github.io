// =============================
// GLOBAL
// =============================
let autoRefreshInterval = null;
let isPlayerActive = false;
let leagueMap = {};
let allMatches = [];

// =============================
// FORMAT STATUS
// =============================
function formatStatus(status) {
  if (!status) return "";

  const s = status.trim().toUpperCase();

  // - = LIVE
  if (s === "-") {
    return `<span class="text-red-500 font-bold animate-pulse">LIVE</span>`;
  }

  // FT
  if (s === "FT") {
    return `<span class="text-gray-400 font-semibold">FT</span>`;
  }

  // เวลา เช่น 19:30
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    return `<span class="text-yellow-400 font-medium">${s}</span>`;
  }

  return s;
}

// =============================
// PLAY STREAM
// =============================
function playStream(url) {
  if (!url) return;

  const video = document.getElementById("videoPlayer");
  const playerBox = document.getElementById("playerBox");

  isPlayerActive = true;
  playerBox.classList.add("active");

  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
  } else {
    video.src = url;
  }

  video.play();
}

// =============================
// RENDER TABLE
// =============================
function renderTable(matches) {
  const tbody = document.querySelector("#matchesTable tbody");
  tbody.innerHTML = "";

  matches.forEach(match => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${match.home}</td>
      <td>${match.away}</td>
      <td>${match.datetime}</td>
      <td>${formatStatus(match.status)}</td>
      <td>${match.channel || "-"}</td>
      <td>
        <button onclick="playStream('${match.stream}')"
          class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm">
          ▶ ดูสด
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// =============================
// FILTER SEARCH
// =============================
function filterTable() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();

  const filtered = allMatches.filter(m =>
    m.home.toLowerCase().includes(keyword) ||
    m.away.toLowerCase().includes(keyword)
  );

  renderTable(filtered);
}

// =============================
// LOAD DATA (ตัวอย่างจำลอง)
// =============================
async function parseMatches() {

  // 🔥 ตัวอย่างข้อมูล (คุณสามารถแทนด้วย fetch() จริงได้)
  allMatches = [
    {
      home: "Manchester United",
      away: "Chelsea",
      datetime: "23/02/2026 19:30",
      status: "-",
      channel: "PPTV",
      stream: "https://test-stream.m3u8"
    },
    {
      home: "Barcelona",
      away: "Real Madrid",
      datetime: "23/02/2026 21:00",
      status: "21:00",
      channel: "beIN",
      stream: "https://test-stream.m3u8"
    },
    {
      home: "Bayern",
      away: "Dortmund",
      datetime: "22/02/2026",
      status: "FT",
      channel: "True",
      stream: "https://test-stream.m3u8"
    }
  ];

  renderTable(allMatches);
}

// =============================
// AUTO REFRESH
// =============================
function startAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }

  autoRefreshInterval = setInterval(async () => {
    console.log("🔄 Auto Refresh...");

    if (!isPlayerActive) {
      await parseMatches();
    }

  }, 60000);
}

// =============================
// INIT
// =============================
document.addEventListener("DOMContentLoaded", () => {
  parseMatches();
  startAutoRefresh();
});
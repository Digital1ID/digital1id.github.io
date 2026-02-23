// ==============================
// CONFIG
// ==============================

const sheetURL = "YOUR_JSON_URL_HERE"; // 🔥 ใส่ URL JSON ของคุณ

let allMatches = {};
let hls = null;

// ==============================
// INIT
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  loadMatches();
  window.addEventListener("resize", renderAll);
});

// ==============================
// MOBILE CHECK
// ==============================

function isMobileView() {
  return window.innerWidth <= 768;
}

// ==============================
// LOAD DATA
// ==============================

async function loadMatches() {
  try {
    const res = await fetch(sheetURL);
    const data = await res.json();

    allMatches = data;
    populateLeagueFilter();
    renderAll();

  } catch (err) {
    console.error("โหลดข้อมูลไม่สำเร็จ", err);
  }
}

// ==============================
// FILTER DROPDOWN
// ==============================

function populateLeagueFilter() {
  const select = document.getElementById("leagueSelect");
  select.innerHTML = `<option value="all">ทุกลีก</option>`;

  Object.keys(allMatches).forEach(league => {
    select.innerHTML += `<option value="${league}">${league}</option>`;
  });

  select.addEventListener("change", renderAll);
  document.getElementById("statusSelect").addEventListener("change", renderAll);
}

// ==============================
// RENDER
// ==============================

function renderAll() {

  const leagueFilter = document.getElementById("leagueSelect").value;
  const searchText = document.getElementById("searchInput").value.toLowerCase();

  const target = isMobileView()
    ? document.getElementById("matchesContainer")
    : document.querySelector("#matchesTable tbody");

  target.innerHTML = "";

  Object.keys(allMatches).forEach(league => {

    if (leagueFilter !== "all" && league !== leagueFilter) return;

    allMatches[league].forEach(match => {

      const textMatch =
        match.homeTeam.toLowerCase().includes(searchText) ||
        match.awayTeam.toLowerCase().includes(searchText) ||
        league.toLowerCase().includes(searchText);

      if (!textMatch) return;

      appendMatchRow(target, match, league);
    });
  });
}

// ==============================
// APPEND ROW / CARD
// ==============================

function appendMatchRow(target, match, league) {

  const displayStatus = match.status;
  const statusClass = getStatusClass(displayStatus);

  // ======================
  // 📱 MOBILE CARD
  // ======================
  if (isMobileView()) {

    const card = document.createElement("div");
    card.className = "match-card";

    card.innerHTML = `
      <div class="match-top">
        <div class="team">
          <img src="${match.homeLogo}" class="logo">
          <span>${match.homeTeam}</span>
        </div>

        <div class="score">
          ${match.score !== "-" ? match.score : "VS"}
        </div>

        <div class="team">
          <span>${match.awayTeam}</span>
          <img src="${match.awayLogo}" class="logo">
        </div>
      </div>

      <div class="match-bottom">
        <div>${match.date}</div>

        <div class="status ${statusClass}">
          ${displayStatus}
        </div>

        <div class="channel"
          onclick="playStream(
            '${match.url}',
            '${match.homeTeam}',
            '${match.awayTeam}',
            '${league}'
          )">
          <img src="${match.logo}" class="logo">
          ${match.channel}
        </div>
      </div>
    `;

    target.appendChild(card);
    return;
  }

  // ======================
  // 💻 DESKTOP TABLE
  // ======================

  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>
      <img src="${match.homeLogo}" class="logo"> ${match.homeTeam}
    </td>

    <td>
      ${match.score !== "-" ? match.score : "VS"}
    </td>

    <td>
      <img src="${match.awayLogo}" class="logo"> ${match.awayTeam}
    </td>

    <td>${match.date}</td>

    <td>
      <span class="status ${statusClass}">
        ${displayStatus}
      </span>
    </td>

    <td class="channel-cell"
        onclick="playStream(
          '${match.url}',
          '${match.homeTeam}',
          '${match.awayTeam}',
          '${league}'
        )">
      <img src="${match.logo}" class="logo">
      ${match.channel}
    </td>
  `;

  target.appendChild(tr);
}

// ==============================
// STATUS COLOR
// ==============================

function getStatusClass(status) {
  if (status === "LIVE") return "live";
  if (status === "FT") return "ft";
  return "upcoming";
}

// ==============================
// SEARCH
// ==============================

function filterTable() {
  renderAll();
}

// ==============================
// VIDEO PLAYER
// ==============================

function playStream(url, home, away, league) {

  const video = document.getElementById("videoPlayer");
  const playerBox = document.getElementById("playerBox");

  if (hls) {
    hls.destroy();
  }

  if (Hls.isSupported()) {
    hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
  }

  playerBox.scrollIntoView({ behavior: "smooth" });
}
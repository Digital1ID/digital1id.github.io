// ==============================
// GLOBAL
// ==============================
const leagueMap = {};
let autoRefreshInterval = null;
let hlsPlayer = null;

// ==============================
// MOBILE CHECK
// ==============================
function isMobileView() {
  return window.innerWidth <= 768;
}

// ==============================
// SAVE / LOAD SELECTED LEAGUE
// ==============================
function saveSelectedLeague(league) {
  localStorage.setItem("selectedLeague", league);
}

function getSavedLeague() {
  return localStorage.getItem("selectedLeague") || "all";
}

// ==============================
// STATUS FILTER
// ==============================
function filterByStatus(statusFilter, matchStatus) {
  if (statusFilter === "all") return true;

  const status = matchStatus.toUpperCase();

  if (statusFilter === "LIVE") return status === "LIVE";
  if (statusFilter === "FT") return status === "FT";
  if (statusFilter === "UPCOMING")
    return status !== "LIVE" && status !== "FT";

  return true;
}

// ==============================
// FETCH & PARSE MATCHES
// ==============================
async function parseMatches() {
  try {

    const res = await fetch("https://api-soccer.thai-play.com/api/v4/iptv/livescore/now?token=JF6pHMnpVCRUeEsSqAAjTWA4GbGhMrpD");
    const htmlText = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");

    const containers = doc.querySelectorAll("div.row.gy-3");
    const leagueSelect = document.getElementById("leagueSelect");

    Object.keys(leagueMap).forEach(key => delete leagueMap[key]);

    containers.forEach(container => {

      const statusNode = container.querySelector("div.col-lg-1 div, div.col-lg-1 span");
      const statusText = statusNode ? statusNode.textContent.trim() : "-";

      const homeTeam = container.querySelector("div.text-end p")?.textContent.trim() || "ทีมเหย้า";
      const awayTeam = container.querySelector("div.text-start p")?.textContent.trim() || "ทีมเยือน";

      const leagueNode = container.closest("div.col-lg-12")
        ?.previousElementSibling
        ?.querySelector("strong.text-uppercase");

      const leagueFull = leagueNode
        ? leagueNode.textContent.trim().replace("|", ":")
        : "ไม่ระบุลีก";

      const dateNode = container.closest("div").querySelector("b.fs-4");
      const thaiDate = dateNode
        ? dateNode.textContent.trim()
        : new Date().toLocaleDateString("th-TH");

      const images = container.querySelectorAll("img");
      const homeLogo = images[0]?.src || "";
      const awayLogo = images[1]?.src || "";

      const scoreNode = container.querySelector("div.col-lg-2 p");
      const scoreText = scoreNode ? scoreNode.textContent.trim() : "-";

      const streams = container.querySelectorAll("img.iam-list-tv");
      const seenChannels = new Set();

      streams.forEach(stream => {

        const channel = stream.getAttribute("alt");
        if (seenChannels.has(channel)) return;
        seenChannels.add(channel);

        let url = stream.getAttribute("data-url");
        const logo = stream.getAttribute("src");
        if (!url) return;

        url = url.replace(":443", "").replace("/dooballfree-com/", "/do-ball.com/");

        if (!leagueMap[leagueFull]) {
          leagueMap[leagueFull] = [];

          if (![...leagueSelect.options].some(opt => opt.value === leagueFull)) {
            const opt = document.createElement("option");
            opt.value = leagueFull;
            opt.textContent = leagueFull;
            leagueSelect.appendChild(opt);
          }
        }

        leagueMap[leagueFull].push({
          homeTeam,
          awayTeam,
          homeLogo,
          awayLogo,
          date: thaiDate,
          status: statusText,
          score: scoreText,
          channel,
          logo,
          url
        });

      });

    });

    const savedLeague = getSavedLeague();

    if (savedLeague && leagueMap[savedLeague]) {
      document.getElementById("leagueSelect").value = savedLeague;
      renderFilteredLeague();
    } else {
      document.getElementById("leagueSelect").value = "all";
      renderAllLeagues();
    }

  } catch (err) {

    document.querySelector("#matchesTable tbody").innerHTML =
      `<tr><td colspan="6">ไม่สามารถโหลดข้อมูลการแข่งขัน</td></tr>`;
  }
}

// ==============================
// STATUS FORMAT
// ==============================
function formatStatus(statusText) {

  const raw = statusText ? statusText.trim().toUpperCase() : "";

  if (raw === "FT") return "FT";
  if (/^\d{1,2}[:.]\d{2}$/.test(raw))
    return raw.replace(".", ":");
  if (raw.includes("LIVE")) return "LIVE";
  if (raw === "" || raw === "-") return "LIVE";

  return raw;
}

// ==============================
// STATUS CLASS
// ==============================
function getStatusClass(status) {

  const s = status.toUpperCase();

  if (s === "LIVE") return "status-live";
  if (s === "FT") return "status-ft";
  return "status-upcoming";
}

// ==============================
// RENDER ALL
// ==============================
function renderAllLeagues() {

  const isMobile = isMobileView();

  const tableBody = document.querySelector("#matchesTable tbody");
  const mobileContainer = document.getElementById("matchesContainer");

  tableBody.innerHTML = "";
  mobileContainer.innerHTML = "";

  Object.keys(leagueMap).forEach(league => {

    if (!isMobile) {
      const leagueRow = document.createElement("tr");
      leagueRow.classList.add("league-header");
      leagueRow.innerHTML = `<td colspan="6">${league}</td>`;
      tableBody.appendChild(leagueRow);
    }

    leagueMap[league].forEach(match => {
      appendMatchRow(isMobile ? mobileContainer : tableBody, match, league);
    });

  });
}

// ==============================
// RENDER FILTERED
// ==============================
function renderFilteredLeague() {

  const selectedLeague = document.getElementById("leagueSelect").value;
  const isMobile = isMobileView();

  const tableBody = document.querySelector("#matchesTable tbody");
  const mobileContainer = document.getElementById("matchesContainer");

  tableBody.innerHTML = "";
  mobileContainer.innerHTML = "";

  saveSelectedLeague(selectedLeague);

  if (selectedLeague === "all") {
    renderAllLeagues();
    return;
  }

  if (!leagueMap[selectedLeague]) {
    renderAllLeagues();
    return;
  }

  if (!isMobile) {
    const leagueRow = document.createElement("tr");
    leagueRow.classList.add("league-header");
    leagueRow.innerHTML = `<td colspan="6">${selectedLeague}</td>`;
    tableBody.appendChild(leagueRow);
  }

  leagueMap[selectedLeague].forEach(match => {
    appendMatchRow(isMobile ? mobileContainer : tableBody, match, selectedLeague);
  });
}

// ==============================
// APPEND MATCH
// ==============================
function appendMatchRow(target, match, league) {

  const statusFilter = document.getElementById("statusSelect")?.value || "all";
  const displayStatus = formatStatus(match.status);
  if (!filterByStatus(statusFilter, displayStatus)) return;

  const statusClass = getStatusClass(displayStatus);

  // 📱 MOBILE CARD
  if (isMobileView()) {

    const card = document.createElement("div");
    card.className = "match-card";

    card.innerHTML = `
      <div class="match-top">
        <div class="team">
          <img src="${match.homeLogo}" class="logo">
          ${match.homeTeam}
        </div>
        <div class="score">
          ${match.score !== "-" ? match.score : "VS"}
        </div>
        <div class="team">
          ${match.awayTeam}
          <img src="${match.awayLogo}" class="logo">
        </div>
      </div>

      <div class="match-bottom">
        <div>📅 ${match.date}</div>
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

  // 💻 DESKTOP TABLE (2 แถว)
  const rowTop = document.createElement("tr");
  rowTop.innerHTML = `
    <td colspan="2">
      <img src="${match.homeLogo}" class="logo">
      ${match.homeTeam}
    </td>
    <td style="text-align:center;font-weight:700;">
      ${match.score !== "-" ? match.score : "VS"}
    </td>
    <td colspan="3" style="text-align:right;">
      ${match.awayTeam}
      <img src="${match.awayLogo}" class="logo">
    </td>
  `;

  const rowBottom = document.createElement("tr");
  rowBottom.innerHTML = `
    <td colspan="2">📅 ${match.date}</td>
    <td style="text-align:center;">
      <span class="status ${statusClass}">
        ${displayStatus}
      </span>
    </td>
    <td colspan="3"
        class="channel-cell"
        style="text-align:right;cursor:pointer;"
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

  target.appendChild(rowTop);
  target.appendChild(rowBottom);
}

// ==============================
// PLAY STREAM
// ==============================
function playStream(url, homeTeam, awayTeam, league) {

  if (!url) return;

  const playerBox = document.getElementById("playerBox");
  const video = document.getElementById("videoPlayer");

  playerBox.classList.add("active");

  document.querySelector("#playerBox h2").textContent =
    `⚽ ${league} | ${homeTeam} vs ${awayTeam}`;

  if (hlsPlayer) {
    hlsPlayer.destroy();
    hlsPlayer = null;
  }

  if (Hls.isSupported()) {
    hlsPlayer = new Hls();
    hlsPlayer.loadSource(url);
    hlsPlayer.attachMedia(video);
    video.play();
  } else {
    video.src = url;
    video.play();
  }

  playerBox.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ==============================
// AUTO REFRESH
// ==============================
function startAutoRefresh() {
  if (autoRefreshInterval) clearInterval(autoRefreshInterval);
  autoRefreshInterval = setInterval(parseMatches, 60000);
}

// ==============================
// INIT
// ==============================
document.addEventListener("DOMContentLoaded", async () => {

  document.getElementById("playerBox").classList.remove("active");

  document.getElementById("leagueSelect")
    .addEventListener("change", renderFilteredLeague);

  document.getElementById("statusSelect")
    .addEventListener("change", renderFilteredLeague);

  window.addEventListener("resize", renderFilteredLeague);

  await parseMatches();
  startAutoRefresh();
});
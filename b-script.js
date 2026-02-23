// ==============================
// GLOBAL
// ==============================
const leagueMap = {};
let autoRefreshInterval = null;
let hlsPlayer = null;


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

    // ล้างข้อมูลเก่า
    Object.keys(leagueMap).forEach(key => delete leagueMap[key]);

    containers.forEach(container => {

      const statusNode = container.querySelector("div.col-lg-1 div, div.col-lg-1 span");
      const statusText = statusNode ? statusNode.textContent.trim() : "-";

      const matchTime = statusText.replace(/(\d{1,2}):(\d{2})/, "$1.$2");

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

      const homeLogo = container.querySelector("div.col-lg-1.col-md-1.text-center.my-auto.d-none.d-md-block img")?.src || "";
      const awayLogo = container.querySelector("div.col-lg-1.col-md-1.col-1.text-center.my-auto.d-none.d-md-block img")?.src || "";

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

          // เพิ่มลีกใน dropdown ถ้ายังไม่มี
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
          time: matchTime,
          status: statusText,
          score: scoreText,
          channel,
          logo,
          url
        });

      });

    });

    renderAllLeagues();

  } catch (err) {

    document.querySelector("#matchesTable tbody").innerHTML =
      `<tr><td colspan="7">ไม่สามารถโหลดข้อมูลการแข่งขัน</td></tr>`;

  }
}


// ==============================
// FORCE LIVE STATUS
// ==============================
function forceLiveStatus(matchDate, matchTime, statusText) {

  if (statusText.toUpperCase() === "FT") return "FT";

  if (!matchTime || matchTime === "-") {
    return "LIVE";
  }

  if (!matchDate.includes("/")) return statusText;

  const [day, month, year] = matchDate.split("/");
  const gregorianYear = parseInt(year) - 543;
  const [hour, minute] = matchTime.split(".");

  const matchDateTime = new Date(gregorianYear, month - 1, day, hour, minute);
  const now = new Date();

  if (now < matchDateTime) return "UPCOMING";
  if (now >= matchDateTime) return "LIVE";

  return statusText || "UPCOMING";
}


// ==============================
// STATUS CLASS
// ==============================
function getStatusClass(status) {
  const s = status.toUpperCase();

  if (s.includes("LIVE") || s.includes("+") || s === "HT") return "status-live";
  if (s === "FT") return "status-ft";
  return "status-upcoming";
}


// ==============================
// RENDER ALL
// ==============================
function renderAllLeagues() {

  const tbody = document.querySelector("#matchesTable tbody");
  tbody.innerHTML = "";

  Object.keys(leagueMap).forEach(league => {

    const leagueRow = document.createElement("tr");
    leagueRow.classList.add("league-header", "animate-fadeIn");
    leagueRow.innerHTML = `<td colspan="7">${league}</td>`;
    tbody.appendChild(leagueRow);

    leagueMap[league].forEach(match => {

      const tr = document.createElement("tr");
      tr.classList.add("animate-fadeIn");

      const forcedStatus = forceLiveStatus(match.date, match.time, match.status);
      const statusClass = getStatusClass(forcedStatus);
      const displayTime = (match.time && match.time !== "-") ? match.time : "ไม่ระบุเวลา";

      tr.innerHTML = `
        <td data-label="ทีมเหย้า"><img src="${match.homeLogo}" class="logo"> ${match.homeTeam}</td>
        <td class="vs-cell">${match.score !== "-" ? match.score : "VS"}</td>
        <td data-label="ทีมเยือน"><img src="${match.awayLogo}" class="logo"> ${match.awayTeam}</td>
        <td data-label="วันที่ / เวลา">${match.date} / ${displayTime}</td>
        <td data-label="สถานะ"><span class="status ${statusClass}">${forcedStatus}</span></td>
        <td data-label="ช่อง"><img src="${match.logo}" class="logo"> ${match.channel}</td>
        <td data-label="ดูสด">
          <button onclick="playStream('${match.url}', '${match.homeTeam}', '${match.awayTeam}', '${league}', this.closest('tr'))">
            ▶️ เล่น
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

  });
}


// ==============================
// PLAY STREAM
// ==============================
function playStream(url, homeTeam, awayTeam, league, rowElement) {

  if (!url) return;

  const playerBox = document.getElementById("playerBox");
  const video = document.getElementById("videoPlayer");

  playerBox.classList.add("active");

  document.querySelector("#playerBox h2").textContent =
    `⚽ ${league} | ${homeTeam} vs ${awayTeam}`;

  // ป้องกัน Memory Leak
  if (hlsPlayer) {
    hlsPlayer.destroy();
    hlsPlayer = null;
  }

  if (Hls.isSupported()) {
    hlsPlayer = new Hls();
    hlsPlayer.loadSource(url);
    hlsPlayer.attachMedia(video);
    video.play();
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
    video.play();
  } else {
    alert("ไม่รองรับการเล่น .m3u8");
  }

  document.querySelectorAll("#matchesTable tbody tr")
    .forEach(tr => tr.classList.remove("active-match"));

  if (rowElement) rowElement.classList.add("active-match");

  playerBox.scrollIntoView({ behavior: "smooth", block: "center" });
}


// ==============================
// SEARCH
// ==============================
function filterTable() {

  const input = document.getElementById("searchInput").value.toLowerCase();
  const rows = document.querySelectorAll("#matchesTable tbody tr");

  rows.forEach(row => {

    if (row.classList.contains("league-header")) {
      row.style.display = "";
      return;
    }

    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(input) ? "" : "none";

  });
}


// ==============================
// AUTO REFRESH
// ==============================
function startAutoRefresh() {

  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }

  autoRefreshInterval = setInterval(async () => {

    const leagueSelect = document.getElementById("leagueSelect");
    const selectedLeague = leagueSelect.value;

    await parseMatches();

    leagueSelect.value = selectedLeague;

  }, 60000);

}


// ==============================
// INIT
// ==============================
document.addEventListener("DOMContentLoaded", async () => {

  const playerBox = document.getElementById("playerBox");
  const leagueSelect = document.getElementById("leagueSelect");

  playerBox.classList.remove("active");

  await parseMatches();

  leagueSelect.addEventListener("change", function() {

    if (this.value === "all") {
      renderAllLeagues();
    } else {
      renderLeagueMatches(this.value);
    }

  });

  startAutoRefresh();

});
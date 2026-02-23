// ==============================
// GLOBAL
// ==============================
const leagueMap = {};
let autoRefreshInterval = null;
let hlsPlayer = null;
let hideFinished = false;


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

    const selectedLeague = leagueSelect.value;

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

      const homeLogo = container.querySelector("img")?.src || "";
      const awayLogo = container.querySelectorAll("img")[1]?.src || "";

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

    renderAllLeagues(selectedLeague);

  } catch (err) {
    document.querySelector("#matchesTable tbody").innerHTML =
      `<tr><td colspan="7">โหลดข้อมูลไม่สำเร็จ</td></tr>`;
  }
}


// ==============================
// STATUS FORMAT
// ==============================
function formatStatus(statusText) {

  const raw = statusText ? statusText.trim().toUpperCase() : "-";

  if (raw === "FT") return "FT";
  if (raw === "-" || raw === "") return "LIVE";
  if (/^\d{1,2}[:.]\d{2}$/.test(raw)) return raw.replace(".", ":");

  return raw;
}


// ==============================
// RENDER
// ==============================
function renderAllLeagues(filterLeague = "all") {

  const tbody = document.querySelector("#matchesTable tbody");
  tbody.innerHTML = "";

  Object.keys(leagueMap).forEach(league => {

    if (filterLeague !== "all" && league !== filterLeague) return;

    const leagueRow = document.createElement("tr");
    leagueRow.className = "league-header";
    leagueRow.innerHTML = `<td colspan="7">${league}</td>`;
    tbody.appendChild(leagueRow);

    // 🔥 เรียง LIVE ก่อน
    const sortedMatches = leagueMap[league].sort((a, b) => {
      const aLive = formatStatus(a.status) === "LIVE" ? 0 : 1;
      const bLive = formatStatus(b.status) === "LIVE" ? 0 : 1;
      return aLive - bLive;
    });

    sortedMatches.forEach(match => {

      const displayStatus = formatStatus(match.status);

      if (hideFinished && displayStatus === "FT") return;

      const tr = document.createElement("tr");

      if (displayStatus === "LIVE") {
        tr.classList.add("live-row");
      }

      tr.innerHTML = `
        <td><img src="${match.homeLogo}" class="logo"> ${match.homeTeam}</td>
        <td>${match.score !== "-" ? match.score : "VS"}</td>
        <td><img src="${match.awayLogo}" class="logo"> ${match.awayTeam}</td>
        <td>${match.date}</td>
        <td><span class="status">${displayStatus}</span></td>
        <td><img src="${match.logo}" class="logo"> ${match.channel}</td>
        <td>
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

  document.querySelectorAll("#matchesTable tbody tr")
    .forEach(tr => tr.classList.remove("active-match"));

  if (rowElement) rowElement.classList.add("active-match");
}


// ==============================
// AUTO REFRESH
// ==============================
function startAutoRefresh() {
  if (autoRefreshInterval) clearInterval(autoRefreshInterval);

  autoRefreshInterval = setInterval(async () => {
    await parseMatches();
  }, 60000);
}


// ==============================
// INIT
// ==============================
document.addEventListener("DOMContentLoaded", async () => {

  await parseMatches();
  startAutoRefresh();

  document.getElementById("leagueSelect")
    .addEventListener("change", function () {
      renderAllLeagues(this.value);
    });

});
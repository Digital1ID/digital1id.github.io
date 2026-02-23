const leagueMap = {};

async function parseMatches() {
  try {
    const res = await fetch("https://api-soccer.thai-play.com/api/v4/iptv/livescore/now?token=JF6pHMnpVCRUeEsSqAAjTWA4GbGhMrpD");
    const htmlText = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");

    const containers = doc.querySelectorAll("div.row.gy-3");
    const leagueSelect = document.getElementById("leagueSelect");

    containers.forEach(container => {
      const statusNode = container.querySelector("div.col-lg-1 div, div.col-lg-1 span");
      const statusText = statusNode ? statusNode.textContent.trim() : "-";

      const matchTime = statusText.replace(/(\d{1,2}):(\d{2})/, "$1.$2");
      const homeTeam = container.querySelector("div.text-end p")?.textContent.trim() || "ทีมเหย้า";
      const awayTeam = container.querySelector("div.text-start p")?.textContent.trim() || "ทีมเยือน";

      const leagueNode = container.closest("div.col-lg-12").previousElementSibling?.querySelector("strong.text-uppercase");
      const leagueFull = leagueNode ? leagueNode.textContent.trim().replace("|", ":") : "ไม่ระบุลีก";

      const dateNode = container.closest("div").querySelector("b.fs-4");
      const thaiDate = dateNode ? dateNode.textContent.trim() : new Date().toLocaleDateString("th-TH");

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
          const opt = document.createElement("option");
          opt.value = leagueFull;
          opt.textContent = leagueFull;
          leagueSelect.appendChild(opt);
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

    leagueSelect.addEventListener("change", function() {
      const selectedLeague = this.value;
      if (selectedLeague === "all") {
        renderAllLeagues();
      } else {
        renderLeagueMatches(selectedLeague);
      }
    });

  } catch (err) {
    document.querySelector("#matchesTable tbody").innerHTML =
      `<tr><td colspan="9">ไม่สามารถโหลดข้อมูลการแข่งขัน</td></tr>`;
  }
}

// ✅ ฟังก์ชันบังคับสถานะ LIVE ตามเวลา
function forceLiveStatus(matchDate, matchTime, statusText) {
  if (statusText.toUpperCase() === "FT") return "FT";

  // 🔥 ถ้าไม่มีเวลา → ให้เป็น LIVE ทันที
  if (!matchTime || matchTime === "-") {
    return "LIVE";
  }

  const [day, month, year] = matchDate.split("/");
  const gregorianYear = parseInt(year) - 543;
  const [hour, minute] = matchTime.split(".");
  const matchDateTime = new Date(gregorianYear, month - 1, day, hour, minute);

  const now = new Date();

  // ✅ ถ้ามีเวลาและยังไม่ถึง → UPCOMING
  if (now < matchDateTime) {
    return "UPCOMING";
  }

  // ✅ ถ้ามีเวลาและถึงแล้ว → LIVE
  if (now >= matchDateTime && statusText !== "FT") {
    return "LIVE";
  }

  return statusText || "UPCOMING";
}

// ✅ ฟังก์ชันตรวจสอบสถานะ
function getStatusClass(status) {
  const statusUpper = status.toUpperCase();
  if (statusUpper.includes("LIVE") || statusUpper.includes("+") || statusUpper === "HT") {
    return "status-live";
  } else if (statusUpper === "FT") {
    return "status-ft";
  } else {
    return "status-upcoming";
  }
}

function renderAllLeagues() {
  const tbody = document.querySelector("#matchesTable tbody");
  tbody.innerHTML = "";

  Object.keys(leagueMap).forEach(league => {
    const leagueRow = document.createElement("tr");
    leagueRow.classList.add("league-header", "animate-fadeIn");
    leagueRow.innerHTML = `<td colspan="9">${league}</td>`;
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
        <td data-label="ช่อง"><img src="${match.logo}" class="logo" alt="${match.channel}"> ${match.channel}</td>
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

function renderLeagueMatches(league) {
  const tbody = document.querySelector("#matchesTable tbody");
  tbody.innerHTML = "";

  if (!leagueMap[league]) return;

  const leagueRow = document.createElement("tr");
  leagueRow.classList.add("league-header", "animate-fadeIn");
  leagueRow.innerHTML = `<td colspan="9">${league}</td>`;
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
      <td data-label="ช่อง"><img src="${match.logo}" class="logo" alt="${match.channel}"> ${match.channel}</td>
      <td data-label="ดูสด">
        <button onclick="playStream('${match.url}', '${match.homeTeam}', '${match.awayTeam}', '${league}', this.closest('tr'))">
          ▶️ เล่น
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function playStream(url, homeTeam = "", awayTeam = "", league = "", rowElement = null) {
  if (!url) return;
  const playerBox = document.getElementById("playerBox");
  playerBox.classList.add("active");

  const title = document.querySelector("#playerBox h2");
  if (homeTeam && awayTeam && league) {
    title.textContent = `⚽ ${league} | ${homeTeam} vs ${awayTeam}`;
  } else {
    title.textContent = "⚽ ตัวเล่นวิดีโอ";
  }

  const video = document.getElementById("videoPlayer");
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
    video.play();
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
    video.play();
  } else {
    alert("เบราว์เซอร์นี้ไม่รองรับการเล่นสตรีม .m3u8");
  }

  // ✅ ลบ highlight เดิมออกก่อน
  document.querySelectorAll("#matchesTable tbody tr").forEach(tr => {
    tr.classList.remove("active-match");
  });

  // ✅ ใส่ highlight ให้คู่ที่กดเล่น
  if (rowElement) {
    rowElement.classList.add("active-match", "animate-fadeIn");
  }

  // ✅ เลื่อนมาที่ playerBox และโฟกัส videoPlayer
  playerBox.scrollIntoView({ behavior: "smooth", block: "center" });
  video.focus();
}

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

// ✅ ซ่อน Player ตอนโหลดหน้า และเริ่มโหลดข้อมูล
document.addEventListener("DOMContentLoaded", () => {
  const playerBox = document.getElementById("playerBox");
  if (playerBox) {
    playerBox.classList.remove("active");
  }

  // ✅ เริ่มโหลดข้อมูลเมื่อเปิดหน้า
  parseMatches();
});
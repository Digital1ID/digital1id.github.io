const channelMap = {};

async function parseMatches() {
  try {
    const res = await fetch("https://api-soccer.thai-play.com/api/v4/iptv/livescore/now?token=JF6pHMnpVCRUeEsSqAAjTWA4GbGhMrpD");
    const htmlText = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");

    const containers = doc.querySelectorAll("div.row.gy-3");
    const tbody = document.querySelector("#matchesTable tbody");
    const channelSelect = document.getElementById("channelSelect");

    let currentLeague = "";

    containers.forEach(container => {
      const statusNode = container.querySelector("div.col-lg-1 div");
      const statusText = statusNode ? statusNode.textContent.trim() : "";
      if (statusText.toUpperCase() === "FT") return;

      const matchTime = statusText.replace(/(\d{1,2}):(\d{2})/, "$1.$2");
      const homeTeam = container.querySelector("div.text-end p")?.textContent.trim() || "ทีมเหย้า";
      const awayTeam = container.querySelector("div.text-start p")?.textContent.trim() || "ทีมเยือน";

      // ✅ ดึงชื่อลีก
      const leagueNode = container.closest("div.col-lg-12").previousElementSibling?.querySelector("strong.text-uppercase");
      const leagueFull = leagueNode ? leagueNode.textContent.trim().replace("|", ":") : "ไม่ระบุลีก";

      const dateNode = container.closest("div").querySelector("b.fs-4");
      const thaiDate = dateNode ? dateNode.textContent.trim() : new Date().toLocaleDateString("th-TH");

      // ✅ เพิ่มหัวข้อลีก
      if (leagueFull !== currentLeague) {
        currentLeague = leagueFull;
        const leagueRow = document.createElement("tr");
        leagueRow.innerHTML = `<td colspan="8" class="league-header">${currentLeague}</td>`;
        tbody.appendChild(leagueRow);
      }

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

        // ✅ รวมช่องซ้ำเป็น dropdown
        if (!channelMap[channel]) {
          channelMap[channel] = { url, logo };
const opt = document.createElement("option");
opt.value = url;
opt.textContent = channel;
opt.dataset.home = homeTeam;
opt.dataset.away = awayTeam;
opt.dataset.league = leagueFull;
channelSelect.appendChild(opt);
        }

const tr = document.createElement("tr");
tr.innerHTML = `
  <td>${leagueFull}</td>
  <td><img src="${container.querySelector("div.text-end img")?.src || ""}" class="logo"> ${homeTeam}</td>
  <td><img src="${container.querySelector("div.text-start img")?.src || ""}" class="logo"> ${awayTeam}</td>
  <td>${thaiDate}</td>
  <td>${matchTime}</td>
  <td>${statusText}</td>
  <td><img src="${logo}" class="logo" alt="${channel}"> ${channel}</td>
  <td><button onclick="playStream('${url}', '${homeTeam}', '${awayTeam}', '${leagueFull}')">เล่น</button></td>
`;
tbody.appendChild(tr);
      });
    });
    
channelSelect.addEventListener("change", function() {
  const selected = this.options[this.selectedIndex];
  playStream(selected.value, selected.dataset.home, selected.dataset.away, selected.dataset.league);
});
    
  } catch (err) {
    document.querySelector("#matchesTable tbody").innerHTML =
      `<tr><td colspan="8">ไม่สามารถโหลดข้อมูลการแข่งขัน</td></tr>`;
  }
}

function playStream(url, homeTeam = "", awayTeam = "", league = "") {
  if (!url) return;
  document.getElementById("playerBox").style.display = "block"; // ✅ แสดงตัวเล่นเมื่อกดเล่น

  // ✅ อัปเดตหัวข้อให้ตรงกับคู่ที่เลือก
  const title = document.querySelector("#playerBox h2");
  if (homeTeam && awayTeam && league) {
    title.textContent = `🎬 ${league} | ${homeTeam} vs ${awayTeam}`;
  } else {
    title.textContent = "🎬 ตัวเล่นวิดีโอ";
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

// ✅ เริ่มโหลดข้อมูลเมื่อเปิดหน้า
parseMatches();
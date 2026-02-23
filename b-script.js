const leagueMap = {}; // เก็บลีกและคู่แข่งขัน

async function parseMatches() {
  try {
    const res = await fetch("https://api-soccer.thai-play.com/api/v4/iptv/livescore/now?token=JF6pHMnpVCRUeEsSqAAjTWA4GbGhMrpD");
    const htmlText = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");

    const containers = doc.querySelectorAll("div.row.gy-3");
    const tbody = document.querySelector("#matchesTable tbody");
    const leagueSelect = document.getElementById("leagueSelect");

    containers.forEach(container => {
      const statusNode = container.querySelector("div.col-lg-1 div");
      const statusText = statusNode ? statusNode.textContent.trim() : "";
      if (statusText.toUpperCase() === "FT") return;

      const matchTime = statusText.replace(/(\d{1,2}):(\d{2})/, "$1.$2");
      const homeTeam = container.querySelector("div.text-end p")?.textContent.trim() || "ทีมเหย้า";
      const awayTeam = container.querySelector("div.text-start p")?.textContent.trim() || "ทีมเยือน";

      const leagueNode = container.closest("div.col-lg-12").previousElementSibling?.querySelector("strong.text-uppercase");
      const leagueFull = leagueNode ? leagueNode.textContent.trim().replace("|", ":") : "ไม่ระบุลีก";

      const dateNode = container.closest("div").querySelector("b.fs-4");
      const thaiDate = dateNode ? dateNode.textContent.trim() : new Date().toLocaleDateString("th-TH");

      // ✅ ดึงโลโก้ทีมเหย้าและทีมเยือน
      const homeLogo = container.querySelector("div.col-lg-1.col-md-1.text-center.my-auto.d-none.d-md-block img")?.src || "";
      const awayLogo = container.querySelector("div.col-lg-1.col-md-1.col-1.text-center.my-auto.d-none.d-md-block img")?.src || "";

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

        // ✅ เก็บข้อมูลตามลีก
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
          channel,
          logo,
          url
        });
      });
    });

    // ✅ เมื่อเลือกลีก
    leagueSelect.addEventListener("change", function() {
      const selectedLeague = this.value;
      renderLeagueMatches(selectedLeague);
    });

  } catch (err) {
    document.querySelector("#matchesTable tbody").innerHTML =
      `<tr><td colspan="8">ไม่สามารถโหลดข้อมูลการแข่งขัน</td></tr>`;
  }
}

function renderLeagueMatches(league) {
  const tbody = document.querySelector("#matchesTable tbody");
  tbody.innerHTML = "";

  if (!leagueMap[league]) return;

  // หัวข้อลีก
  const leagueRow = document.createElement("tr");
  leagueRow.innerHTML = `<td colspan="8" class="league-header">${league}</td>`;
  tbody.appendChild(leagueRow);

  leagueMap[league].forEach(match => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${league}</td>
      <td><img src="${match.homeLogo}" class="logo"> ${match.homeTeam}</td>
      <td><img src="${match.awayLogo}" class="logo"> ${match.awayTeam}</td>
      <td>${match.date}</td>
      <td>${match.time}</td>
      <td>${match.status}</td>
      <td><img src="${match.logo}" class="logo" alt="${match.channel}"> ${match.channel}</td>
      <td><button onclick="playStream('${match.url}', '${match.homeTeam}', '${match.awayTeam}', '${league}')">เล่น</button></td>
    `;
    tbody.appendChild(tr);
  });
}


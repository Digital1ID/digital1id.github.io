// =============================
// FLIX Movie Player - app.js
// =============================

let playlistData = [];
let currentIndex = 0;
let currentSeason = null;
let serialData = null;

// =============================
// ✅ อ่าน Query String (Flexible)
// =============================
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);

  const id = params.get("id") || params.get("file");

  const seasonParam = params.get("season");
  const season = seasonParam ? parseInt(seasonParam) : null;

  let file = params.get("data") || "playlist.json";
  if (!file.endsWith(".json")) {
    file += ".json";
  }

  const name = params.get("name")
    ? decodeURIComponent(params.get("name"))
    : null;

  return { id, season, file, name };
}

// =============================
// ✅ แปลงลิงก์ Akuma (.txt → player จริง)
// =============================
function resolveAkumaUrl(url) {
  if (!url) return "";
  if (url.includes("files.akuma-player.xyz/view/") && url.endsWith(".txt")) {
    const id = url.split("/").pop().replace(".txt", "");
    return `https://akuma-player.xyz/play/${id}?v=1`;
  }
  return url;
}

// =============================
// ✅ สร้าง URL สำหรับเรียก engine player
// =============================
function buildPlayerUrl(ep) {
  const engine = ep.engine || serialData?.engine || "videojs";
  const resolvedUrl = resolveAkumaUrl(ep.video);

  let url = `${engine}.html?file=${encodeURIComponent(resolvedUrl)}&name=${encodeURIComponent(ep.name)}`;

  if (ep.subtitle) {
    url += `&subtitle=${encodeURIComponent(ep.subtitle)}`;
  }

  if (ep.subtitle_en) {
    url += `&subtitle_en=${encodeURIComponent(ep.subtitle_en)}`;
  }

  return url;
}

// =============================
// 🎬 แสดงข้อมูลซีรีส์ (Netflix Style)
// =============================
function showInfo(info, serialName, category) {
  const serialDetails = document.getElementById("serialDetails");

  if (!serialDetails) return;

  const seasonNumber = currentSeason?.season || 1;
  const seasonName = currentSeason?.name || `Season ${seasonNumber}`;
  const year = info?.year || "-";
  const plot = info?.plot || info?.description || "ไม่มีข้อมูล";
  const poster = info?.poster || "";

  serialDetails.innerHTML = `
    <div style="display:flex; gap:20px; flex-wrap:wrap; align-items:flex-start;">
      
      ${poster ? `
        <div>
          <img src="${poster}" 
               alt="${serialName}" 
               style="width:180px; border-radius:10px; box-shadow:0 10px 25px rgba(0,0,0,.5);">
        </div>
      ` : ""}

      <div style="flex:1; min-width:250px;">
        <h2 style="font-size:22px; font-weight:700; margin-bottom:8px;">
          ${serialName || "-"}
        </h2>

        <div style="color:#b3b3b3; margin-bottom:10px;">
          ${seasonName} • ${year} • ${category || "-"}
        </div>

        <p style="line-height:1.6; color:#ddd;">
          ${plot}
        </p>
      </div>

    </div>
  `;
}

// =============================
// ✅ เล่นตอนตาม index
// =============================
function playEpisodeByIndex(index) {
  if (!playlistData[index]) return;

  const ep = playlistData[index];
  const videoFrame = document.getElementById("videoFrame");
  const videoTitle = document.getElementById("videoTitle");

  const url = buildPlayerUrl(ep);

  videoFrame.src = url;
  videoFrame.style.height = "480px";
  videoFrame.scrollIntoView({ behavior: "smooth", block: "center" });

// =============================
// อัปเดต Title (ชื่อเรื่อง + ซีซั่น + ตอน)
// =============================
const seriesName = serialData?.name || "";
const seasonName = currentSeason?.name || `Season ${currentSeason?.season || ""}`;
const episodeName = ep.name || "";

const fullTitle = `${seriesName} - ${seasonName} - ${episodeName}`;

videoTitle.innerHTML = `
  <div class="text-lg font-bold">${seriesName}</div>
  <div class="text-sm text-gray-400">${seasonName} - ${episodeName}</div>
`;

document.title = fullTitle;

  currentIndex = index;

  // ปิดปุ่มเมื่อถึงขอบ
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (prevBtn) prevBtn.disabled = (index === 0);
  if (nextBtn) nextBtn.disabled = (index === playlistData.length - 1);

  // ไฮไลท์ตอนที่เล่น
  document.querySelectorAll("#playlist button")
    .forEach(b => b.classList.remove("active-episode"));

  const btn = document.querySelectorAll("#playlist button")[index];
  if (btn) btn.classList.add("active-episode");
}

// =============================
// ✅ โหลดซีซัน
// =============================
function loadSeason(season) {
  playlistData = season?.episodes || [];
  const playlistEl = document.getElementById("playlist");
  playlistEl.innerHTML = "";

  playlistData.forEach((ep, index) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");

    btn.textContent = `EP${ep.episode}: ${ep.name}`;
    btn.className =
      "block w-full text-left px-3 py-2 bg-[#333] rounded hover:bg-[#444]";

    btn.addEventListener("click", () => playEpisodeByIndex(index));

    li.appendChild(btn);
    playlistEl.appendChild(li);
  });

  currentIndex = 0;

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (prevBtn) prevBtn.disabled = true;
  if (nextBtn) nextBtn.disabled = playlistData.length <= 1;
}

// =============================
// ✅ โหลด JSON แบบยืดหยุ่น (NO TDZ BUG)
// =============================
async function init() {
  const { id, season, file } = getQueryParams();

  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error("โหลดไฟล์ไม่สำเร็จ");

    const jsonData = await res.json();

    if (!Array.isArray(jsonData)) {
      throw new Error("รูปแบบ JSON ไม่ถูกต้อง");
    }

    serialData = jsonData.find(item => item.id === id);

    if (!serialData) {
      document.getElementById("serialDetails").innerHTML =
        "<p class='text-red-500'>ไม่พบข้อมูลซีรีส์</p>";
      return;
    }

    let seasonIndex = season ? parseInt(season) - 1 : 0;

    currentSeason =
      serialData.seasons?.[seasonIndex] ||
      serialData.seasons?.[0];

    if (!currentSeason) {
      document.getElementById("serialDetails").innerHTML =
        "<p class='text-red-500'>ไม่มีข้อมูลซีซัน</p>";
      return;
    }

    showInfo(
      currentSeason.info,
      serialData.name,
      serialData.category
    );

    const seasonSelect = document.getElementById("seasonSelect");
    seasonSelect.innerHTML = "";

    serialData.seasons.forEach((s, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = `Season ${s.season}`;
      if (idx === seasonIndex) opt.selected = true;
      seasonSelect.appendChild(opt);
    });

    loadSeason(currentSeason);

    seasonSelect.addEventListener("change", (e) => {
      currentSeason = serialData.seasons[e.target.value];
      showInfo(
        currentSeason.info,
        serialData.name,
        serialData.category
      );
      loadSeason(currentSeason);
    });

  } catch (err) {
    console.error("INIT ERROR:", err);
    document.getElementById("serialDetails").innerHTML =
      "<p class='text-red-500'>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>";
  }
}

// เรียกใช้งาน
init();

// =============================
// ✅ ปุ่ม Next / Prev
// =============================
document.getElementById("prevBtn")?.addEventListener("click", () => {
  if (currentIndex > 0) {
    playEpisodeByIndex(currentIndex - 1);
  }
});

document.getElementById("nextBtn")?.addEventListener("click", () => {
  if (currentIndex < playlistData.length - 1) {
    playEpisodeByIndex(currentIndex + 1);
  }
});
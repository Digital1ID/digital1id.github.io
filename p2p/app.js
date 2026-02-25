// =============================
// FLIX Movie Player - app.js
// =============================

let playlistData = [];
let currentIndex = 0;
let currentSeason = null;
let serialData = null;

// =============================
// ✅ อ่าน Query String
// =============================
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    id: params.get("id"),
    season: params.get("season"),
    file: params.get("file") || "playlist.json"
  };
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
  const engine = ep.engine || serialData.engine || "videojs";
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
// ✅ แสดงข้อมูลซีรีส์
// =============================
function showInfo(info, serialName, category) {
  const serialDetails = document.getElementById("serialDetails");

  serialDetails.innerHTML = `
    <p><strong>ชื่อเรื่อง:</strong> ${serialName}</p>
    <p><strong>หมวดหมู่:</strong> ${category}</p>
    <p><strong>ปีที่ออกฉาย:</strong> ${info?.year || "-"}</p>
    <p><strong>รายละเอียด:</strong> ${info?.plot || info?.description || "ไม่มีข้อมูล"}</p>
    ${info?.poster ? `<img src="${info.poster}" alt="${serialName}" class="mt-3 rounded-lg shadow-md">` : ""}
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

  // อัปเดต title
  videoTitle.textContent = ep.name;
  document.title = ep.name;

  currentIndex = index;

  // ปิดปุ่มเมื่อถึงขอบ
  document.getElementById("prevBtn").disabled = (index === 0);
  document.getElementById("nextBtn").disabled = (index === playlistData.length - 1);

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
  playlistData = season.episodes || [];
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
  document.getElementById("prevBtn").disabled = true;
  document.getElementById("nextBtn").disabled = playlistData.length <= 1;
}

// =============================
// ✅ โหลด JSON แบบยืดหยุ่น
// =============================
(async function init() {
  const { id, season, file } = getQueryParams();

  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error("โหลดไฟล์ไม่สำเร็จ");

    const data = await res.json();
    serialData = data.find(item => item.id === id);

    if (!serialData) {
      document.getElementById("serialDetails").innerHTML =
        "<p class='text-red-500'>ไม่พบข้อมูลซีรีส์</p>";
      return;
    }

    let seasonIndex = season ? parseInt(season) - 1 : 0;
    currentSeason =
      serialData.seasons[seasonIndex] || serialData.seasons[0];

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
    console.error(err);
    document.getElementById("serialDetails").innerHTML =
      "<p class='text-red-500'>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>";
  }
})();

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
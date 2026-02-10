let playlistData = [];
let currentIndex = 0;
let currentSeason = null;
let serialData = null;

// ✅ อ่าน query string
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    id: params.get("id") || params.get("file"),
    season: params.get("season"),
    name: params.get("name")
  };
}

// ✅ แสดงข้อมูลซีรีส์/ซีซัน
function showInfo(info, serialName, category) {
  const serialDetails = document.getElementById("serialDetails");
  serialDetails.innerHTML = `
    <p><strong>ชื่อเรื่อง:</strong> ${name}</p>
    <p><strong>หมวดหมู่:</strong> ${category}</p>
    <p><strong>ปีที่ออกฉาย:</strong> ${info.year}</p>
    <p><strong>เรื่องย่อ:</strong> ${info.description}</p>
    <img src="${info.poster}" alt="${serialName}" class="mt-3 rounded-lg shadow-md">
  `;
}

// ✅ เล่นตอน
function playEpisode(url, index) {
  const videoFrame = document.getElementById("videoFrame");

  // ตั้งค่า src
  videoFrame.src = url;

  // ขยาย iframe ให้แสดงผล
  videoFrame.style.height = "480px";

  videoFrame.scrollIntoView({ behavior: "smooth", block: "center" });

  currentIndex = index;
  document.querySelectorAll("#playlist button").forEach(b => b.classList.remove("active-episode"));
  document.querySelectorAll("#playlist button")[index].classList.add("active-episode");
}

// ✅ โหลดซีซัน
function loadSeason(season) {
  playlistData = season.episodes;
  const playlistEl = document.getElementById("playlist");
  playlistEl.innerHTML = "";

  season.episodes.forEach((ep, index) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");

    // ใช้ engine จาก episode ถ้ามี, ถ้าไม่มีใช้ของ serialData
    const engine = ep.engine || serialData.engine || "videojs";
    const url = `${engine}.html?file=${encodeURIComponent(ep.video)}&name=${encodeURIComponent(ep.name)}`;

    btn.textContent = `EP${ep.episode}: ${ep.name}`;
    btn.className = "block w-full text-left px-3 py-2 bg-[#333] rounded hover:bg-[#444]";
    btn.addEventListener("click", () => playEpisode(url, index));

    li.appendChild(btn);
    playlistEl.appendChild(li);
  });
}

// ✅ โหลดข้อมูลจาก playlist.json
fetch("playlist.json")
  .then(res => res.json())
  .then(data => {
    const { id, season } = getQueryParams();
    serialData = data.find(item => item.id === id);

    if (!serialData) {
      document.getElementById("serialDetails").innerHTML = "<p class='text-red-500'>ไม่พบข้อมูลซีรีส์</p>";
      return;
    }

    let seasonIndex = season ? parseInt(season) - 1 : 0;
    currentSeason = serialData.seasons[seasonIndex] || serialData.seasons[0];

    showInfo(currentSeason.info, serialData.name, serialData.category);

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
      showInfo(currentSeason.info, serialData.name, serialData.category);
      loadSeason(currentSeason);
    });
  });

// ✅ ปุ่ม Next/Prev
document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    const ep = playlistData[currentIndex];
    const engine = ep.engine || serialData.engine || "videojs";
    const url = `index.html?file=${encodeURIComponent(ep.video)}&name=${encodeURIComponent(ep.name)}&engine=${engine}`;
    playEpisode(url, currentIndex);
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  if (currentIndex < playlistData.length - 1) {
    currentIndex++;
    const ep = playlistData[currentIndex];
    const engine = ep.engine || serialData.engine || "videojs";
    const url = `index.html?file=${encodeURIComponent(ep.video)}&name=${encodeURIComponent(ep.name)}&engine=${engine}`;
    playEpisode(url, currentIndex);
  }
});

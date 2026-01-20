const params = new URLSearchParams(window.location.search);
const file = params.get("file");
const name = params.get("name");

let playlistData = [];
let currentIndex = 0;
let currentSeason = null;
let serialData = null;

// โหลด iframe
function loadIframe(src, title) {
  const iframe = document.getElementById("videoFrame");
  iframe.src = src;

  document.title = title;
  document.getElementById("videoTitle").textContent = title;

  updateButtons();
  highlightCurrent();
}

// อัพเดตปุ่ม Next/Prev
function updateButtons() {
  document.getElementById("prevBtn").disabled = currentIndex === 0;
  document.getElementById("nextBtn").disabled = currentIndex === playlistData.length - 1;
}

// highlight ตอนที่กำลังเล่น
function highlightCurrent() {
  const buttons = document.querySelectorAll("#playlist button");
  buttons.forEach((btn, idx) => {
    btn.classList.remove("active-episode");
    if (idx === currentIndex) btn.classList.add("active-episode");
  });
}

// แสดงข้อมูลซีรีส์
function showSerialInfo(serial) {
  const serialDetails = document.getElementById("serialDetails");
  serialDetails.innerHTML = `
    <p><strong>ชื่อเรื่อง:</strong> ${serial.name}</p>
    <p><strong>หมวดหมู่:</strong> ${serial.category}</p>
    <p><strong>ปีที่ออกฉาย:</strong> ${serial.info.year}</p>
    <p><strong>เรื่องย่อ:</strong> ${serial.info.description}</p>
    <img src="${serial.info.poster}" alt="${serial.name}" class="mt-3 rounded-lg shadow-md">
  `;
}

// โหลดซีซัน
function loadSeason(season) {
  playlistData = season.episodes;
  const playlistEl = document.getElementById("playlist");
  playlistEl.innerHTML = "";

  season.episodes.forEach((ep, index) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");

    // ใช้ query string index.html?file=...&name=...
    const url = `./p2p/index.html?file=${encodeURIComponent(ep.video)}&name=${encodeURIComponent(ep.name)}`;
    btn.textContent = `EP${ep.episode}: ${ep.name}`;
    btn.className = "w-full text-left px-3 py-2 bg-[#333] rounded hover:bg-[#444]";
    btn.addEventListener("click", () => {
      currentIndex = index;
      window.location.href = url;
    });

    li.appendChild(btn);
    playlistEl.appendChild(li);
  });

  if (season.episodes.length > 0 && !file) {
    currentIndex = 0;
    loadIframe(season.episodes[0].video, season.episodes[0].name);
  }
}

// โหลดข้อมูลจาก playlist.json
fetch("playlist.json")
  .then(res => res.json())
  .then(data => {
    serialData = data[0];
    showSerialInfo(serialData);

    const seasonSelect = document.getElementById("seasonSelect");
    serialData.seasons.forEach((season, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = `Season ${season.season}`;
      seasonSelect.appendChild(opt);
    });

    currentSeason = serialData.seasons[0];
    loadSeason(currentSeason);

    seasonSelect.addEventListener("change", (e) => {
      currentSeason = serialData.seasons[e.target.value];
      loadSeason(currentSeason);
    });

    // ถ้ามีค่า file จาก query string ให้โหลด iframe ทันที
    if (file) {
      loadIframe(file, name || "Now Playing");
    }
  });

// ปุ่ม Next/Prev
document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    const ep = playlistData[currentIndex];
    loadIframe(ep.video, ep.name);
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  if (currentIndex < playlistData.length - 1) {
    currentIndex++;
    const ep = playlistData[currentIndex];
    loadIframe(ep.video, ep.name);
  }
});

// ปุ่ม reload
document.getElementById("reloadBtn").addEventListener("click", (e) => {
  e.preventDefault();
  if (file) {
    loadIframe(file, name || "Now Playing");
  }
});

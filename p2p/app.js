let playlistData = [];
let currentIndex = 0;
let currentSeason = null;
let serialData = null;

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

function loadSeason(season) {
  playlistData = season.episodes;
  const playlistEl = document.getElementById("playlist");
  playlistEl.innerHTML = "";

  season.episodes.forEach((ep, index) => {
    const li = document.createElement("li");
    const btn = document.createElement("a");

    // ✅ ใช้ query string ./p2p/index.html?file=...&name=...
    const url = `./p2p/index.html?file=${encodeURIComponent(ep.video)}&name=${encodeURIComponent(ep.name)}`;

    btn.textContent = `EP${ep.episode}: ${ep.name}`;
    btn.href = url;
    btn.className = "block w-full text-left px-3 py-2 bg-[#333] rounded hover:bg-[#444]";

    li.appendChild(btn);
    playlistEl.appendChild(li);
  });
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
  });

// ปุ่ม Next/Prev และ Reload ใช้ query string
document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    const ep = playlistData[currentIndex];
    const url = `./p2p/index.html?file=${encodeURIComponent(ep.video)}&name=${encodeURIComponent(ep.name)}`;
    window.location.href = url;
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  if (currentIndex < playlistData.length - 1) {
    currentIndex++;
    const ep = playlistData[currentIndex];
    const url = `./p2p/index.html?file=${encodeURIComponent(ep.video)}&name=${encodeURIComponent(ep.name)}`;
    window.location.href = url;
  }
});

document.getElementById("reloadBtn").addEventListener("click", (e) => {
  e.preventDefault();
  if (playlistData[currentIndex]) {
    const ep = playlistData[currentIndex];
    const url = `./p2p/index.html?file=${encodeURIComponent(ep.video)}&name=${encodeURIComponent(ep.name)}`;
    window.location.href = url;
  }
});

let playlistData = [];
let currentIndex = 0;
let currentSeason = null;
let serialData = null;

// ✅ อ่าน query string จาก URL
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    id: params.get("id"),
    name: params.get("name")
  };
}

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
    const btn = document.createElement("button");

    // ✅ ใช้ playlist.html?id=...&name=...
    const url = `index.html?file=${encodeURIComponent(ep.video)}&name=${encodeURIComponent(ep.name)}`;

    btn.textContent = `EP${ep.episode}: ${ep.name}`;
    btn.className = "block w-full text-left px-3 py-2 bg-[#333] rounded hover:bg-[#444]";

    btn.addEventListener("click", () => {
      currentIndex = index;
      document.getElementById("videoFrame").src = url;
      document.getElementById("videoFrame").scrollIntoView({ behavior: "smooth", block: "center" });

      document.querySelectorAll("#playlist button").forEach(b => b.classList.remove("active-episode"));
      btn.classList.add("active-episode");
    });

    li.appendChild(btn);
    playlistEl.appendChild(li);
  });
}

// ✅ โหลดข้อมูลจาก playlist.json ตาม id
fetch("playlist.json")
  .then(res => res.json())
  .then(data => {
    const { id } = getQueryParams();
    serialData = data.find(item => item.id === id);

    if (!serialData) {
      document.getElementById("serialDetails").innerHTML = "<p class='text-red-500'>ไม่พบข้อมูลซีรีส์</p>";
      return;
    }

    showSerialInfo(serialData);

    const seasonSelect = document.getElementById("seasonSelect");
    seasonSelect.innerHTML = "";

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

// ✅ ปุ่ม Next/Prev
document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    const ep = playlistData[currentIndex];
    const url = `index.html?file=${encodeURIComponent(ep.video)}&name=${encodeURIComponent(ep.name)}`;
    document.getElementById("videoFrame").src = url;
    document.getElementById("videoFrame").scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  if (currentIndex < playlistData.length - 1) {
    currentIndex++;
    const ep = playlistData[currentIndex];
    const url = `index.html?file=${encodeURIComponent(ep.video)}&name=${encodeURIComponent(ep.name)}`;
    document.getElementById("videoFrame").src = url;
    document.getElementById("videoFrame").scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

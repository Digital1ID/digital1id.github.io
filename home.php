<?php include 'www/header.php';?>
<?php include 'http://oneid151.serv00.net/www/menu.php';?>

  <style>
body {
  margin: 0;
  font-family: 'Segoe UI', 'Roboto', sans-serif;
  background-color: #0f0f0f;
  color: #fff;
}

/* 🔠 หัวข้อช่อง */
#channelTitle {
  font-size: 24px;
  font-weight: 600;
  padding: 12px 20px;
  background-color: #1c1c1c;
  border-bottom: 2px solid #444;
  text-align: center;
  display: none;
}

/* 🧭 หัวข้อหมวดหมู่ */
#categoryTitle {
  font-size: 20px;
  font-weight: 500;
  text-align: center;
  margin-top: 10px;
  color: #ccc;
}

/* 🗂️ หมวดหมู่และช่อง */
#categories, #channels {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 20px;
  justify-content: center;
}

/* 📺 ปุ่มช่อง */
.channel-button {
  background-color: #1e1e1e;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 10px;
  /*width: 120px;*/
  width: 100%;
  max-width: 150px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  color: #fff;
}
@media (max-width: 600px) {
  #channels, #categories {
    flex-direction: column;
    align-items: center;
  }
}

.channel-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
  background-color: #2a2a2a;
}

.channel-button img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 8px;
  border-radius: 8px;
}

.channel-button div {
  font-size: 14px;
  font-weight: 500;
}

/* 📺 iframe player */
.responsive-iframe {
  position: relative;
  width: 100%;
  max-width: 960px;
  margin: 20px auto;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  background-color: #000;
}

.responsive-iframe iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

/* 🎥 Clappr video */
#playertv {
  display: block;
  margin: 20px auto;
  max-width: 685px;
  width: 100%;
  text-align: center;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}

/* 🔍 ช่องค้นหา */
#searchInput {
  display: inline-block;
  margin: 10px auto 20px auto;
  padding: 10px;
  width: 250px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #444;
  background-color: #1c1c1c;
  color: #fff;
}

#searchResults {
  text-align: center;
  margin-top: 10px;
  font-size: 16px;
  color: #ccc;
}

/* 🗂️ Tabs กลุ่ม */
#groupTabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

#groupTabs button {
  background-color: #0078d4;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

#groupTabs button:hover {
  background-color: #005fa3;
}

/* 📱 Responsive */
@media screen and (max-width: 600px) {
  .channel-button {
    width: 120px;
    padding: 8px;
  }

  .channel-button img {
    width: 80px;
    height: 80px;
  }

  #channelTitle {
    font-size: 18px;
  }

  #searchInput {
    width: 80%;
  }

  #groupTabs button {
    padding: 8px 12px;
    font-size: 14px;
  }

  #playertv {
    width: 100%;
    margin: 10px auto;
  }
}
  </style>
</head>
<body>

<div id="iframe-container" class="responsive-iframe">
  <iframe id="channel-frame" allowfullscreen></iframe>
</div>

<div id="playertv"></div>
<div id="channelTitle"></div>

<!-- 🗂️ Tabs สำหรับกลุ่ม -->
<div id="groupTabs">
  <button onclick="switchGroup('ช่องรายการ')">ช่องรายการ</button>
  <button onclick="switchGroup('เทสระบบ')">เทสระบบ</button>
  <button onclick="switchGroup('รายการสด')">รายการถ่ายทอดสด</button>
</div>
<!-- 🔍 ช่องค้นหา -->
<div style="text-align:center; margin-bottom:20px;">
  <input type="text" id="searchInput" placeholder="พิมพ์ชื่อช่อง..." />
  <button onclick="searchChannels()">🔍 ค้นหา</button>
</div>

<div id="searchResults" style="text-align:center; margin-top:10px;"></div>

<!-- 🧭 หมวดหมู่ -->
<h2 id="categoryTitle"></h2>
<div id="categories"></div>
<!-- 📺 ช่องรายการ -->
<div id="channels"></div>

<script src="https://cdn.jsdelivr.net/gh/clappr/clappr@latest/dist/clappr.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/clappr/dash-shaka-playback@latest/dist/dash-shaka-playback.js"></script>
<script>
let channelData = [];
let categoryList = [];
let currentGroup = 'ช่องรายการ';
let clapprPlayer = null;

const urls = [
  { url: 'http://oneid151.serv00.net/iptv2json.php?url=live/index.php', group: 'ช่องรายการ' },
  { url: 'http://oneid151.serv00.net/iptv2json.php?url=live/iptvfw.php', group: 'เทสระบบ' },
  { url: 'http://oneid151.serv00.net/iptv2json.php?url=http://oneid151.serv00.net/m3u/ball7m_playlist.php', group: 'รายการสด' }
];

Promise.allSettled(urls.map(item =>
  fetch(item.url).then(res => res.json()).then(data => ({
    group: item.group,
    channels: Object.values(data).flat()
  }))
)).then(results => {
  const validGroups = results.filter(r => r.status === 'fulfilled').map(r => r.value);
  if (validGroups.length === 0) return alert('โหลดข้อมูลไม่สำเร็จ ❌');

  channelData = validGroups.flatMap(group =>
    group.channels.map(c => ({ ...c, sourceGroup: group.group }))
  );

  updateCategoryList();
  renderCategories();
  updateCategoryTitle();
});

// 🖼️ ไอคอนเฉพาะสำหรับแต่ละหมวดหมู่
const categoryIcons = {
  'MONOMAX SPORTS': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIhwCkiStDcZU4KbFreFFtdDux_5yrPZ97GQ&s',
  'BALLTHAI': 'https://thaileague.co.th/assets/img/thaileague_meta_logo.jpeg',
  'Movies | Series': 'https://cdn-icons-png.flaticon.com/512/747/747376.png',
  'SPOTV': 'https://images.seeklogo.com/logo-png/47/1/spotv-now-logo-png_seeklogo-475838.png',
  'ไม่ระบุหมวดหมู่': 'https://cdn-icons-png.flaticon.com/512/565/565547.png'
};

function updateCategoryList() {
  const categories = [...new Set(channelData
    .filter(c => c.sourceGroup === currentGroup)
    .map(c => c.group || 'ไม่ระบุหมวดหมู่'))];

  categoryList = categories.map(name => ({
    name,
    icon: categoryIcons[name] || 'https://cdn-icons-png.flaticon.com/512/2947/2947623.png' // fallback
  }));
}

function switchGroup(groupName) {
  currentGroup = groupName;
  updateCategoryList();
  renderCategories();
  updateCategoryTitle();
}

function updateCategoryTitle() {
  const title = document.getElementById('categoryTitle');
  title.textContent = `${currentGroup}`;
  title.style.display = 'block';
}

function renderCategories() {
  const categoriesDiv = document.getElementById('categories');
  const channelsDiv = document.getElementById('channels');
  categoriesDiv.innerHTML = '';
  channelsDiv.style.display = 'none';
  categoriesDiv.style.display = 'flex';

  categoryList.forEach(cat => {
    const button = document.createElement('div');
    button.classList.add('channel-button');
    button.tabIndex = 0;
    button.innerHTML = `
      <img src="${cat.icon}" style="width:60px; height:60px;">
      <div>${cat.name}</div>
    `;
    button.onclick = () => showChannelsInCategory(cat.name);
    button.onkeydown = e => { if (e.key === 'Enter') showChannelsInCategory(cat.name); };
    categoriesDiv.appendChild(button);
  });
}

function showChannelsInCategory(categoryName) {
  const channelsDiv = document.getElementById('channels');
  const categoriesDiv = document.getElementById('categories');
  channelsDiv.innerHTML = '';
  channelsDiv.style.display = 'flex';
  categoriesDiv.style.display = 'none';
  document.getElementById('categoryTitle').textContent = `${currentGroup} - ${categoryName}`;

  const filteredChannels = channelData.filter(c =>
    c.sourceGroup === currentGroup && (c.group || 'ไม่ระบุหมวดหมู่') === categoryName
  );

  filteredChannels.forEach((channel, index) => renderPlaylist(channel, index));

  const backBtn = document.createElement('div');
  backBtn.classList.add('channel-button');
  backBtn.innerHTML = '🔙 ย้อนกลับ';
  backBtn.tabIndex = 0;
  backBtn.onclick = renderCategories;
  backBtn.onkeydown = e => { if (e.key === 'Enter') renderCategories(); };
  channelsDiv.appendChild(backBtn);
}

function renderPlaylist(channel, index) {
  const button = document.createElement('div');
  button.classList.add('channel-button');
  button.tabIndex = 0;
  button.setAttribute('data-name', channel.name.toLowerCase());
  button.innerHTML = `
    <img src="${channel.poster}" alt="${channel.name}" width="80">
    <div>${channel.name}</div>
  `;
  button.onclick = () => loadChannelByData(channel);
  button.onkeydown = e => { if (e.key === 'Enter') loadChannelByData(channel); };
  document.getElementById('channels').appendChild(button);
}

function searchChannels() {
  const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
  const resultsDiv = document.getElementById('searchResults');
  const channelsDiv = document.getElementById('channels');
  const categoriesDiv = document.getElementById('categories');
  const titleDiv = document.getElementById('categoryTitle');

  resultsDiv.innerHTML = '';
  channelsDiv.innerHTML = '';
  channelsDiv.style.display = 'flex';
  categoriesDiv.style.display = 'none';
  titleDiv.textContent = `ผลการค้นหา: "${keyword}"`;
  titleDiv.style.display = 'block';

  if (!keyword) {
    resultsDiv.textContent = '⚠️ กรุณาพิมพ์ชื่อช่องที่ต้องการค้นหา';
    return;
  }

  const matchedChannels = channelData.filter(c =>
    c.name && c.name.toLowerCase().includes(keyword)
  );

  if (matchedChannels.length === 0) {
    resultsDiv.textContent = `❌ ไม่พบช่องที่ตรงกับ "${keyword}"`;
    return;
  }

  matchedChannels.forEach((channel, index) => renderPlaylist(channel, index));

  // ✅ ปุ่มย้อนกลับ
  const backBtn = document.createElement('div');
  backBtn.classList.add('channel-button');
  backBtn.innerHTML = '🔙 ย้อนกลับ';
  backBtn.tabIndex = 0;
  backBtn.onclick = () => {
    resultsDiv.innerHTML = '';
    document.getElementById('searchInput').value = '';
    renderCategories();
    titleDiv.textContent = `หมวดหมู่ของ ${currentGroup}`;
  };
  backBtn.onkeydown = e => { if (e.key === 'Enter') backBtn.onclick(); };
  channelsDiv.appendChild(backBtn);
}

function showChannelTitle(name) {
  const titleDiv = document.getElementById('channelTitle');
  titleDiv.textContent = name;
  titleDiv.style.display = 'block';
}

function loadChannelByData(channel) {
  if (!channel.url || typeof channel.url !== 'string') {
    alert('URL ช่องไม่ถูกต้อง ❌');
    return;
  }

  showChannelTitle(channel.name);
  const type = channel.type || detectType(channel.url);
  loadChannel(channel.url, type, channel);
}

function detectType(url) {
  const cleanUrl = url.split('?')[0];
  if (cleanUrl.endsWith('.m3u8')) return 'hls';
  if (cleanUrl.endsWith('.mpd')) return 'mpd';
  return 'iframe';
}

function loadChannel(url, type, channel = {}) {
  const playerContainer = document.getElementById('playertv');
  playerContainer.innerHTML = '';

  if (type === 'iframe') {
    // ✅ หยุด iframe ก่อนโหลดใหม่
    document.getElementById('channel-frame').src = '';
    document.getElementById('iframe-container').style.display = 'block';
    document.getElementById('channel-frame').src = url;
    return;
  } else {
    // ✅ หยุด iframe เมื่อเปลี่ยนเป็น Clappr
    document.getElementById('channel-frame').src = '';
    document.getElementById('iframe-container').style.display = 'none';
  }

  if (clapprPlayer) {
    clapprPlayer.destroy();
    clapprPlayer = null;
  }

  const playbackPlugins = type === 'mpd' ? [DashShakaPlayback] : [];
  const shakaConfig = {};

  if (type === 'mpd' && channel.license_key && channel.license_type === 'clearkey') {
    const [kid, key] = channel.license_key.split(':');
    shakaConfig.drm = {
      clearKeys: {
        [kid]: key
      }
    };
  }

  clapprPlayer = new Clappr.Player({
    source: url,
    parentId: '#playertv',
    autoPlay: true,
    mute: true,
    width: '685',
    height: '505',
    playbackPlugins,
    playback: {
      playInline: true,
      recycleVideo: true,
      shakaConfiguration: shakaConfig
    }
  });
}
</script>
</body>
</html>

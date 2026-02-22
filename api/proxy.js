// pages/api/proxy.js

export default async function handler(req, res) {
  const target = req.query.url;
  if (!target) {
    res.status(400).json({ error: "Missing url parameter" });
    return;
  }

  try {
    const response = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/146.0.7680.14 Mobile Safari/537.36",
        "Referer": "https://www.xn--72c9ab1ec1bc6q.online/movie-article.php?id=860&nocache=1771756260242"
      }
    });

    if (!response.ok) {
      res.status(response.status).json({ error: "Failed to fetch target" });
      return;
    }

    const contentType = response.headers.get("content-type") || "";
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (contentType.includes("application/vnd.apple.mpegurl") || target.endsWith(".m3u8")) {
      // ถ้าเป็น playlist ให้ rewrite segment
      let text = await response.text();
      const baseUrl = new URL(target);

      text = text.replace(/^(?!#)(.*\.dts.*)$/gm, (line) => {
        const absUrl = new URL(line, baseUrl).href;
        return `/api/proxy?url=${encodeURIComponent(absUrl)}`;
      });

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.send(text);
    } else {
      // ถ้าเป็น segment (.ts/.mp4) ให้ส่งเป็น buffer แทน pipe
      const buffer = await response.arrayBuffer();
      res.setHeader("Content-Type", contentType || "application/octet-stream");
      res.send(Buffer.from(buffer));
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
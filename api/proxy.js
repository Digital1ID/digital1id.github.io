export default async function handler(req, res) {
  const target = req.query.url;
  if (!target) {
    res.status(400).json({ error: "Missing url parameter" });
    return;
  }

  try {
    const response = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Referer": "https://357ms.com/"
      }
    });

    if (!response.ok) {
      res.status(response.status).json({ error: "Failed to fetch target" });
      return;
    }

    const contentType = response.headers.get("content-type") || "";
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", contentType);

    if (contentType.includes("application/vnd.apple.mpegurl") || target.endsWith(".m3u8")) {
      // ถ้าเป็น playlist ให้ rewrite segment
      let text = await response.text();
      const baseUrl = new URL(target);

      text = text.replace(/^(?!#)(.*\.ts.*)$/gm, (line) => {
        const absUrl = new URL(line, baseUrl).href;
        return `/api/proxy?url=${encodeURIComponent(absUrl)}`;
      });

      res.send(text);
    } else {
      // ถ้าเป็น segment ให้ส่งต่อแบบ stream
      response.body.pipe(res);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
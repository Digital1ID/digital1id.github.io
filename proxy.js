// pages/api/proxy.js (สำหรับ Next.js)
// หรือ api/proxy.js (สำหรับ Vercel)

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
        "Referer": "https://www.xn--72c9ab1ec1bc6q.online/"
      }
    });

    if (!response.ok) {
      res.status(response.status).json({ error: "Failed to fetch target" });
      return;
    }

    // ตรวจสอบว่าเป็น playlist หรือ segment
    const contentType = response.headers.get("content-type") || "";
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", contentType);

    if (contentType.includes("application/vnd.apple.mpegurl") || target.endsWith(".m3u8")) {
      // ถ้าเป็น playlist ให้แก้ไขลิงก์ segment ให้ผ่าน proxy ด้วย
      let text = await response.text();
      const baseUrl = new URL(target);

      text = text.replace(/^(?!#)(.*\.ts.*)$/gm, (line) => {
        // ทำให้เป็น absolute URL
        const absUrl = new URL(line, baseUrl).href;
        // rewrite ให้เรียกผ่าน proxy อีกที
        return `proxy?url=${encodeURIComponent(absUrl)}`;
      });

      res.send(text);
    } else {
      // ถ้าเป็น segment (.ts/.mp4) ให้ส่งต่อแบบ stream
      response.body.pipe(res);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
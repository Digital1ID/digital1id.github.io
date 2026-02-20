// proxy.js
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

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/vnd.apple.mpegurl");

    response.body.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
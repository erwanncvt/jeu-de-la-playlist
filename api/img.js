export default async function handler(req, res) {
  const { url } = req.query;
  if (!url || !url.startsWith('https://i.scdn.co/')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  try {
    const r = await fetch(url);
    const buffer = await r.arrayBuffer();
    res.setHeader('Content-Type', r.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(buffer));
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch image' });
  }
}

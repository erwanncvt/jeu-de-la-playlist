export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing YouTube API key' });

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&videoCategoryId=10&maxResults=1&key=${apiKey}`;
    const r = await fetch(url);
    const data = await r.json();

    if (!data.items?.length) {
      return res.status(404).json({ error: 'No video found' });
    }

    const video = data.items[0];
    res.setHeader('Cache-Control', 's-maxage=86400'); // cache 24h
    res.status(200).json({
      videoId: video.id.videoId,
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails?.medium?.url || '',
    });

  } catch (err) {
    res.status(500).json({ error: 'YouTube API error', detail: err.message });
  }
}

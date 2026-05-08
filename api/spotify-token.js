export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Missing Spotify credentials' });
  }

  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();

    if (!data.access_token) {
      return res.status(401).json({ error: 'Failed to get token', detail: data });
    }

    res.setHeader('Cache-Control', 's-maxage=3000, stale-while-revalidate');
    res.status(200).json({ access_token: data.access_token });

  } catch (err) {
    res.status(500).json({ error: 'Network error', detail: err.message });
  }
}

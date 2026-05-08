module.exports = async function handler(req, res) {
  res.json({
    hasId: !!process.env.SPOTIFY_CLIENT_ID,
    hasSecret: !!process.env.SPOTIFY_CLIENT_SECRET,
    idValue: process.env.SPOTIFY_CLIENT_ID ? process.env.SPOTIFY_CLIENT_ID.slice(0,4) : 'none',
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('SPOTIFY'))
  });
}

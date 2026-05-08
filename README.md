# 🎵 Le Jeu de la Playlist

Devinez qui a mis quelle musique ! Un jeu de soirée entre amis.

## Fonctionnalités

- 👥 Multijoueur en passant le téléphone
- 🎵 Recherche de musiques style Spotify (simulée — vraie API prête à brancher)
- ⏱️ Timer 15 secondes avec animation
- 🔗 Partage de l'app + partage de session (scores encodés dans l'URL)
- 📱 Responsive mobile-first

---

## Déploiement sur Vercel (5 minutes)

### 1. Créer un repo GitHub

```bash
git init
git add .
git commit -m "init: Le Jeu de la Playlist"
gh repo create playlist-game --public --push
```

### 2. Connecter à Vercel

1. Va sur [vercel.com](https://vercel.com) → **Add New Project**
2. Importe ton repo GitHub `playlist-game`
3. Framework preset : **Other** (pas Next.js, c'est du HTML pur)
4. Clique **Deploy** — c'est tout !

### 3. Domaine personnalisé (optionnel)

Dans Vercel → Settings → Domains → ajoute `playlist.tondomaine.fr`

---

## Brancher la vraie API Spotify

La recherche est simulée pour l'instant. Pour la vraie API :

### Étape 1 — Créer une app Spotify

1. Va sur [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. **Create app** → note ton `Client ID` et `Client Secret`
3. Dans Redirect URIs : ajoute `https://ton-app.vercel.app`

### Étape 2 — Créer une Vercel Serverless Function

Crée le fichier `api/spotify-token.js` :

```js
// api/spotify-token.js
export default async function handler(req, res) {
  const creds = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await r.json();
  res.setHeader('Cache-Control', 's-maxage=3500');
  res.json({ access_token: data.access_token });
}
```

### Étape 3 — Variables d'environnement dans Vercel

Dans Vercel → Settings → Environment Variables :
- `SPOTIFY_CLIENT_ID` = ton client id
- `SPOTIFY_CLIENT_SECRET` = ton client secret

### Étape 4 — Remplacer spSearch() dans index.html

```js
async function spSearch(q) {
  clearTimeout(spTimeout);
  const res = document.getElementById('sp-results');
  if (!q) { res.style.display = 'none'; return; }

  spTimeout = setTimeout(async () => {
    // 1. Récupérer le token
    const tokenRes = await fetch('/api/spotify-token');
    const { access_token } = await tokenRes.json();

    // 2. Chercher les tracks
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=6&market=FR`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const data = await searchRes.json();
    const hits = data.tracks.items;

    if (!hits.length) { res.style.display = 'none'; return; }
    res.style.display = 'block';
    res.innerHTML = hits.map(t => `
      <div class="sp-item">
        <img class="sp-cover" src="${t.album.images[2]?.url || ''}" alt="${t.name}">
        <div class="sp-info">
          <div class="sp-name">${t.name}</div>
          <div class="sp-art">${t.artists.map(a => a.name).join(', ')}</div>
        </div>
        <button class="sp-add" onclick='addSong(${JSON.stringify({
          id: t.id,
          title: t.name,
          artist: t.artists.map(a => a.name).join(', '),
          cover: t.album.images[2]?.url || '',
          previewUrl: t.preview_url
        })})'>+ Ajouter</button>
      </div>`).join('');
  }, 300);
}
```

---

## Structure du projet

```
playlist-game/
├── index.html          ← App complète (HTML/CSS/JS tout-en-un)
├── vercel.json         ← Config Vercel (headers, clean URLs)
├── README.md           ← Ce fichier
└── api/
    └── spotify-token.js  ← À créer si tu branches Spotify (voir ci-dessus)
```

---

## Roadmap

- [ ] Vraie API Spotify
- [ ] Mode solo (timer seulement, pas de devinette)
- [ ] Catégories / thèmes (années 80, French rap…)
- [ ] Historique des sessions
- [ ] App mobile (Capacitor / Expo pour App Store & Play Store)

// /server/utils/videoUrl.js
// Videos de los desfiles: se aceptan links de YouTube, Vimeo o videos subidos a Cloudinary.
// Cualquier otro dominio se rechaza (no queremos embeber páginas de terceros desconocidos).

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be', 'www.youtube-nocookie.com']);
const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com']);
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

const youtubeId = (url) => {
  if (url.hostname === 'youtu.be') return url.pathname.split('/')[1];
  if (url.pathname === '/watch') return url.searchParams.get('v');
  // /embed/ID, /shorts/ID, /live/ID, /v/ID
  const match = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
  return match?.[1] ?? null;
};

// Vimeo: vimeo.com/123456, vimeo.com/123456/abcdef (no listado), player.vimeo.com/video/123456?h=abcdef
const vimeoParts = (url) => {
  const match = url.pathname.match(/^\/(?:video\/)?(\d{5,12})(?:\/([a-f0-9]{6,20}))?\/?$/i);
  if (!match) return null;
  return { id: match[1], hash: match[2] || url.searchParams.get('h') || null };
};

// Devuelve { provider, url, embedUrl, id } o null si el link no es válido
export const parseVideoUrl = (value) => {
  let url;
  try {
    url = new URL(String(value ?? '').trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.toLowerCase();

  if (YOUTUBE_HOSTS.has(host)) {
    const id = youtubeId(url);
    if (!id || !YOUTUBE_ID.test(id)) return null;
    return {
      provider: 'youtube',
      id,
      url: `https://www.youtube.com/watch?v=${id}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`,
    };
  }

  if (VIMEO_HOSTS.has(host)) {
    const parts = vimeoParts(url);
    if (!parts) return null;
    const hashQuery = parts.hash ? `h=${parts.hash}&` : '';
    return {
      provider: 'vimeo',
      id: parts.id,
      url: `https://vimeo.com/${parts.id}${parts.hash ? `/${parts.hash}` : ''}`,
      embedUrl: `https://player.vimeo.com/video/${parts.id}?${hashQuery}dnt=1&title=0&byline=0&portrait=0`,
    };
  }

  // Video subido a Cloudinary: https://res.cloudinary.com/<cuenta>/video/upload/...
  if (host === 'res.cloudinary.com' && url.protocol === 'https:' && /^\/[^/]+\/video\/upload\//.test(url.pathname)) {
    return { provider: 'cloudinary', id: null, url: `${url.origin}${url.pathname}`, embedUrl: null };
  }

  return null;
};

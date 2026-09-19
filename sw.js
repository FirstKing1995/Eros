// Service worker do Eros.
// Antes ele NÃO guardava nada em cache. Agora usa "stale-while-revalidate" só pro SHELL
// (o próprio index.html, manifest e ícone): a abertura repetida fica INSTANTÂNEA
// (serve do cache na hora) e, ao mesmo tempo, busca a versão nova em segundo plano
// pra aparecer na próxima vez. A API (POST pro Apps Script) e a mídia do Drive
// continuam SEMPRE indo direto pra rede — nada disso é cacheado.
//
// Publicou uma atualização importante e quer forçar todo mundo a pegar na hora?
// Basta subir o número da versão abaixo (ex: v1 -> v2).
const CACHE = 'eros-shell-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html', './manifest.json']).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))); // limpa caches antigos
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // API (POST) sempre pela rede
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;  // Drive / Apps Script: rede pura, sem cache

  // Shell da app: responde do cache na hora e atualiza por trás.
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    const network = fetch(req).then(res => {
      if (res && res.status === 200) { try { cache.put(req, res.clone()); } catch (err) {} }
      return res;
    }).catch(() => cached);
    return cached || network;
  })());
});

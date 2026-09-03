// Service worker mínimo do Eros.
// Existe só para o app poder ser INSTALADO (Chrome exige um SW).
// De propósito, NÃO guarda nada em cache: o app sempre carrega
// a versão mais nova da rede — nada de tela velha presa no aparelho.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => { /* deixa tudo ir direto pra rede */ });

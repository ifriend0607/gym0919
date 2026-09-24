// 같은 주소(ifriend0607.github.io)의 다른 앱(gym0607) 캐시는 건드리지 않도록 'wf-'로 시작하는 것만 정리
// 항상 서버의 최신 파일부터 확인하고(no-cache), 인터넷이 안 될 때만 저장해 둔 파일을 씀
const CACHE = 'wf-v19';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(FILES.map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('wf-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const same = new URL(req.url).origin === location.origin;
  // 같은 사이트 파일은 브라우저 임시 보관본을 건너뛰고 서버에 바뀌었는지 물어봄 (안 바뀌었으면 금방 끝남)
  const net = same ? fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(req);
  e.respondWith(net.then(r => {
    if (same && r.ok) { const c = r.clone(); caches.open(CACHE).then(cache => cache.put(req, c)); }
    return r;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
});

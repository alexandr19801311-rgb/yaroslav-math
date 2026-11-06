const CACHE_NAME = 'math-houses-v47'; // Меняй эту версию при каждом обновлении!
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// 1. Установка: кэшируем файлы и сразу активируем новый SW
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Приказываем новому SW не ждать, а сразу вступать в силу
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Активация: удаляем ВСЕ старые кэши и забираем контроль над страницей
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Удаляем старый кэш:', cacheName);
            return caches.delete(cacheName); // Удаляем всё, что не совпадает с текущей версией
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Сразу берем под контроль все открытые вкладки
    })
  );
});

// 3. Запросы: Сначала идем в сеть, если сети нет — берем из кэша (Network First)
self.addEventListener('fetch', (event) => {
  // Пропускаем запросы, которые не являются GET (например, POST)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Если сеть ответила успешно, обновляем кэш и отдаем свежий ответ
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Если сети нет (офлайн), отдаем файл из кэша
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Если в кэше ничего нет, возвращаем заглушку для HTML
          if (event.request.headers.get('Accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
  );
});

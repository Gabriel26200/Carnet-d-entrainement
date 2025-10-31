const CACHE_NAME = 'lafay-carnet-v5'; // Version incrémentée pour forcer la mise à jour du cache
const urlsToCache = [
    '/Carnet-d-entrainement/', 
    '/Carnet-d-entrainement/index.html',
    '/Carnet-d-entrainement/manifest.json',
    // Ajout des dépendances critiques
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/lucide@latest',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js'
];

// Installation du Service Worker et mise en cache des ressources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Ouverture du cache et mise en cache des URLs');
        return cache.addAll(urlsToCache).then(() => self.skipWaiting()); 
      })
  );
});

// Activation du Service Worker et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) 
  );
});

// Stratégie "Cache First, puis Network" pour la récupération des ressources
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
            // Tentative de servir l'index si la navigation échoue (hors ligne)
            if (event.request.mode === 'navigate') {
                 return caches.match('/Carnet-d-entrainement/index.html');
            }
        });
      })
    );
});

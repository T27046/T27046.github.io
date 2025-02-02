var cacheStorageKey = 'EZCLASSBC'

var cacheList = [
  '/',
  "index.html",
  "R.svg", 
  "Y.svg",
  "G.svg", 
  "D.svg",
  "S.svg", 
  "C.svg", 
  "B.svg", 
  "W.svg",  
  "icon256.png", 
  "E.png"
]
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheStorageKey)
    .then(cache => cache.addAll(cacheList))
    .then(() => self.skipWaiting())
  )
})
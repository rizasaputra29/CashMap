// public/custom-sw.js
self.addEventListener('push', function (event) {
    console.log('Push received');
  });
  
  self.addEventListener('notificationclick', function (event) {
    console.log('Notification clicked');
  });
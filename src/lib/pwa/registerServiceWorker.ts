// Check if service workers are supported
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch((error) => {
          console.error('ServiceWorker registration failed: ', error);
        });
    });

    // Listen for updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Show a message to the user about the new service worker
      console.log('New service worker activated');
    });
  }
};

export default registerServiceWorker;
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-requests') {
    event.waitUntil(notifyClientsToSync());
  }
});

async function notifyClientsToSync() {
  if (self.clients) {
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const client of clients) {
      client.postMessage({ type: 'SYNC_QUEUE' });
    }
  }
}

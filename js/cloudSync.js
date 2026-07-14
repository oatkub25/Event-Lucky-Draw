// Cloud Database Real-time Sync Engine
const CLOUD_SYNC_URL = 'https://kvdb.io/WJ2N9Z4cT8eR5xL1pQ7m2a/sf_canon_participants';

class CloudSyncEngine {
  static async pushCandidate(candidate) {
    try {
      const res = await fetch(CLOUD_SYNC_URL);
      let list = [];
      if (res.ok) {
        list = await res.json();
      }
      if (!Array.isArray(list)) list = [];
      list.push(candidate);

      await fetch(CLOUD_SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(list)
      });
    } catch (e) {
      console.log('Cloud sync push pending:', e);
    }
  }

  static startPoller(onNewParticipantsFound) {
    const fetchCloudData = async () => {
      try {
        const res = await fetch(CLOUD_SYNC_URL);
        if (res.ok) {
          const cloudList = await res.json();
          if (Array.isArray(cloudList) && cloudList.length > 0) {
            onNewParticipantsFound(cloudList);
          }
        }
      } catch (e) {}
    };

    fetchCloudData();
    setInterval(fetchCloudData, 3000);
  }

  static async resetCloudData() {
    try {
      await fetch(CLOUD_SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([])
      });
    } catch (e) {}
  }
}

window.CloudSyncEngine = CloudSyncEngine;

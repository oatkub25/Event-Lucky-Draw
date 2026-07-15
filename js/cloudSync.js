// Real-time Instant Cloud & SSE Broadcast Engine
const CLOUD_SYNC_URL = 'https://kvdb.io/WJ2N9Z4cT8eR5xL1pQ7m2a/sf_canon_participants';
const REALTIME_STREAM_URL = 'https://ntfy.sh/sf_canon_draw_room_2026/sse';

class CloudSyncEngine {
  // Push candidate to cloud storage
  static async pushCandidate(candidate) {
    try {
      // 1. Send live stream event
      fetch('https://ntfy.sh/sf_canon_draw_room_2026', {
        method: 'POST',
        headers: { 'Title': 'New Candidate' },
        body: JSON.stringify(candidate)
      }).catch(e=>{});

      // 2. Persist to KV storage
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

  // Dual engine: Instant SSE (0.1s latency) + 3s KV Poller Fallback
  static startPoller(onNewParticipant) {
    // Engine A: Instant Server-Sent Events (SSE) Listener
    try {
      const sse = new EventSource(REALTIME_STREAM_URL);
      sse.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.message) {
            const candidate = JSON.parse(data.message);
            if (candidate && candidate.id && candidate.name) {
              onNewParticipant([candidate]);
            }
          }
        } catch (err) {}
      };
    } catch (err) {}

    // Engine B: Persistent Cloud Poller
    const fetchCloudData = async () => {
      try {
        const res = await fetch(CLOUD_SYNC_URL);
        if (res.ok) {
          const cloudList = await res.json();
          if (Array.isArray(cloudList) && cloudList.length > 0) {
            onNewParticipant(cloudList);
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

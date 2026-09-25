import http from 'http';

const modelName = process.argv[2] || 'gemma4:e2b-it-qat';
console.log(`Requesting pull for model: ${modelName}`);

const req = http.request(
  {
    hostname: '127.0.0.1',
    port: 11434,
    path: '/api/pull',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  },
  (res) => {
    let lastStatus = '';
    res.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (data.status && data.status !== lastStatus) {
            lastStatus = data.status;
            console.log(`[Status] ${data.status} ${data.completed ? `${Math.round((data.completed / data.total) * 100)}%` : ''}`);
          } else if (data.completed && data.total) {
            const pct = Math.round((data.completed / data.total) * 100);
            if (pct % 20 === 0) {
              console.log(`[Progress] ${pct}% (${(data.completed / 1e6).toFixed(1)} MB / ${(data.total / 1e6).toFixed(1)} MB)`);
            }
          }
          if (data.error) {
            console.error(`[Error] ${data.error}`);
          }
        } catch (e) {
          // ignore partial json
        }
      }
    });
    res.on('end', () => {
      console.log('Pull stream finished.');
    });
  }
);

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.write(JSON.stringify({ name: modelName }));
req.end();

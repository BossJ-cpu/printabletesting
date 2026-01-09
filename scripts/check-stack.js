const targets = [
  { name: 'Laravel', url: 'http://127.0.0.1:8000/api/health' },
  { name: 'React', url: 'http://127.0.0.1:5173/' },
  { name: 'Next.js', url: 'http://127.0.0.1:3000/' },
];

const timeoutMs = 60_000;
const intervalMs = 2_000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ping(url) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5_000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res.ok;
  } catch (error) {
    return false;
  }
}

async function waitForAll() {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const results = await Promise.all(targets.map((t) => ping(t.url)));
    const allUp = results.every(Boolean);
    if (allUp) {
      console.log('React + Laravel + Next.js = Success');
      // Keep process alive to prevent concurrently -k from killing others
      console.log('Stack check passed. Keeping monitor alive...');
      setInterval(() => {}, 60000);
      return;
    }
    const statusLine = targets
      .map((t, i) => `${t.name}:${results[i] ? 'up' : 'down'}`)
      .join(' | ');
    console.log(`Waiting... ${statusLine}`);
    await sleep(intervalMs);
  }
  console.error('React + Laravel = Fail (timed out waiting for both services).');
  process.exit(1);
}

waitForAll();

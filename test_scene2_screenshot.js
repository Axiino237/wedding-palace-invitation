const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function test() {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new', '--remote-debugging-port=9225', '--disable-gpu', 'http://127.0.0.1:8000/index.html'
  ]);
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      await new Promise((res, rej) => http.get('http://127.0.0.1:9225/json/version', res).on('error', rej));
      break;
    } catch(e) {}
  }
  const tabs = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9225/json', r => {
      let d = ''; r.on('data', c => d += c);
      r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });
  const t = tabs.find(x => x.url.includes('8000'));
  const ws = new WebSocket(t.webSocketDebuggerUrl);

  const send = (method, params = {}) => new Promise(res => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (e) => {
      const m = JSON.parse(e.data);
      if (m.id === id) { ws.removeEventListener('message', handler); res(m); }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  await new Promise(r => setTimeout(r, 1000));

  // Trigger s2 directly
  await send('Runtime.evaluate', {
    expression: `
      (function(){
        document.getElementById('s1').style.display = 'none';
        const s2El = document.getElementById('s2');
        s2El.style.visibility = 'visible';
        // Position palace and doors as after car arrival (D = 0)
        s2();
        // Skip animation time to show palace and doors
        const anims = document.getAnimations();
        anims.forEach(a => { if (a.finish) { try { a.finish(); } catch(e){} } });
      })()
    `
  });

  await new Promise(r => setTimeout(r, 1500));

  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/acer/.gemini/antigravity-ide/brain/55aece70-8014-4044-8e24-d19bee7ac5ce/scratch/s2_doors_test.png', Buffer.from(ss.result.data, 'base64'));
  console.log('Saved s2_doors_test.png');

  ws.close();
  edge.kill();
  process.exit(0);
}
test().catch(err => { console.error('Error:', err); process.exit(1); });

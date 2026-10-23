const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function snap(w = 390, h = 844, filename = 'current_scene5.png') {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new', '--remote-debugging-port=9228', '--disable-gpu', 'http://127.0.0.1:8000/index.html'
  ]);
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      await new Promise((res, rej) => http.get('http://127.0.0.1:9228/json/version', res).on('error', rej));
      break;
    } catch(e) {}
  }
  const tabs = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9228/json', r => {
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
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: true });

  await new Promise(r => setTimeout(r, 600));

  await new Promise(r => setTimeout(r, 600));

  const evalRes = await send('Runtime.evaluate', {
    expression: `
      (function(){
        try {
          document.getElementById('s1').style.display = 'none';
          window.toS5();
          return 'SUCCESS: window.toS5 called';
        } catch(e) {
          return 'ERROR: ' + e.message + '\\n' + e.stack;
        }
      })()
    `
  });
  console.log('Eval result:', evalRes);

  await new Promise(r => setTimeout(r, 3500));
  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/' + filename, Buffer.from(ss.result.data, 'base64'));
  console.log('Saved scratch/' + filename);
  ws.close();
  edge.kill();
}

snap().catch(console.error);

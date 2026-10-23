const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

async function snap(w, h, filename, scrollPos = 0) {
  const edge = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
    '--headless=new', '--remote-debugging-port=9232', '--disable-gpu', 'http://127.0.0.1:8000/index.html'
  ]);
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      await new Promise((res, rej) => http.get('http://127.0.0.1:9232/json/version', res).on('error', rej));
      break;
    } catch(e) {}
  }
  const tabs = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9232/json', r => {
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

  await new Promise(r => setTimeout(r, 1200));

  await send('Runtime.evaluate', {
    expression: `
      (function(){
        window.s1 = function(){};
        document.querySelectorAll('.sc').forEach(el => { el.style.display = 'none'; el.classList.remove('on'); });
        const s6 = document.getElementById('s6');
        s6.style.display = 'block';
        s6.classList.add('on');
        s6.style.opacity = '1';
        s6.style.pointerEvents = 'auto';
        document.querySelectorAll('.s6-sec').forEach(s => s.classList.add('revealed'));
        if (${scrollPos} > 0) {
          const scr = document.getElementById('s6-scroll');
          if (scr) scr.scrollTop = ${scrollPos};
        }
      })()
    `
  });

  await new Promise(r => setTimeout(r, 1000));
  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/' + filename, Buffer.from(ss.result.data, 'base64'));
  console.log('Saved scratch/' + filename);
  ws.close();
  edge.kill();
}

async function run() {
  await snap(320, 568, 's6_top_320px.png', 0);
  await new Promise(r => setTimeout(r, 800));
  await snap(360, 640, 's6_top_360px.png', 0);
  await new Promise(r => setTimeout(r, 800));
  await snap(430, 900, 's6_top_430px.png', 0);
  await new Promise(r => setTimeout(r, 800));
  // Also test scrolled down to bottom of form at 360px
  await snap(360, 640, 's6_bottom_form_360px.png', 400);
}

run().catch(console.error);

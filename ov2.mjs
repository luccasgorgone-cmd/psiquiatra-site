import { chromium } from 'playwright-core';
const exe = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
for (const w of [360,390,414]) {
  const p = await b.newPage({ viewport: { width: w, height: 844 }, isMobile: true });
  await p.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1000);
  const r = await p.evaluate(()=>({s:document.documentElement.scrollWidth,c:document.documentElement.clientWidth}));
  console.log(`home @${w}: scrollW=${r.s} clientW=${r.c} ${r.s>r.c?'OVERFLOW':'OK'}`);
  await p.close();
}
await b.close();

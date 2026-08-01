import { chromium } from 'playwright-core';
const exe='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b=await chromium.launch({executablePath:exe,args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:2});
await p.goto('http://localhost:3000/',{waitUntil:'networkidle'}); await p.waitForTimeout(800);
await p.getByText('A abordagem',{exact:false}).first().scrollIntoViewIfNeeded(); await p.waitForTimeout(1000);
await p.screenshot({path:'m3_approach2.png'});
await b.close(); console.log('done');

// Real continuous screen recording of the actual running app (CDP screencast — genuine
// frame-by-frame repaints, real clicks, real CSS transitions) instead of a stitched-stills
// slideshow. A synthetic cursor dot makes taps legible. Narration timing drives the on-screen
// pacing directly, so voice and UI action land together without post-hoc guessing.
const puppeteer = require('puppeteer-core');
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://localhost:8844/senseguard-recording.html';
const ROOT = __dirname;
const FRAMES_DIR = path.join(ROOT, 'frames');
const AUDIO_DIR = path.join(ROOT, 'shots', 'audio_el');
const FFMPEG = 'C:/Users/Aadityaa/AppData/Local/Temp/claude/C--Users-Aadityaa-iqoo/e1ab17ed-4d08-4c73-bf9c-ff8fc8560e80/scratchpad/tools/ffmpeg-master-latest-win64-gpl/bin/ffmpeg.exe';
const FFPROBE = FFMPEG.replace('ffmpeg.exe', 'ffprobe.exe');

fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
fs.mkdirSync(FRAMES_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dur = (key) => parseFloat(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(AUDIO_DIR, `line_${key}.mp3`)]).toString().trim());

const LEAD = 0.5, TAIL = 0.4;
const withPad = (key) => +(dur(key) + LEAD + TAIL).toFixed(2);

// ---- cursor overlay + click helpers --------------------------------------------------
const CURSOR_INJECT = `
  (function(){
    const dot = document.createElement('div');
    dot.id = '__cursor';
    dot.style.cssText = 'position:fixed;left:0;top:0;width:30px;height:30px;border-radius:50%;'
      + 'background:rgba(255,189,89,.30);border:2px solid rgba(255,189,89,.95);pointer-events:none;'
      + 'z-index:2147483647;transform:translate(-50%,-50%);transition:left .09s ease,top .09s ease,transform .08s ease;';
    document.body.appendChild(dot);
    window.addEventListener('mousemove', (e) => { dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px'; });
    window.addEventListener('mousedown', () => { dot.style.transform = 'translate(-50%,-50%) scale(0.55)'; });
    window.addEventListener('mouseup', () => { dot.style.transform = 'translate(-50%,-50%) scale(1)'; });
  })();
`;

async function boxCenter(page, selector, nth = 0) {
  return page.evaluate((sel, n) => {
    const el = document.querySelectorAll(sel)[n];
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, selector, nth);
}

async function tap(page, selector, nth = 0) {
  const { x, y } = await boxCenter(page, selector, nth);
  await page.mouse.move(x, y, { steps: 22 });
  await sleep(140);
  await page.mouse.down();
  await sleep(90);
  await page.mouse.up();
}

async function scrollMainTo(page, y, steps = 6, totalMs = 700) {
  const start = await page.evaluate(() => document.getElementById('screenScan').scrollTop);
  for (let i = 1; i <= steps; i++) {
    const v = start + ((y - start) * i) / steps;
    await page.evaluate((val) => { document.getElementById('screenScan').scrollTop = val; }, v);
    await sleep(totalMs / steps);
  }
}

// ---- the timeline ---------------------------------------------------------------------
// Each phase: total on-screen duration, optional narration key, optional timed events
// (seconds from the phase's own start) that perform a real click/scroll/state change.
const TIMELINE = [
  { audio: '00', events: [] },

  { audio: '01', events: [
    { at: 0.3, fn: (p) => tap(p, '.ctx[data-ctx="pharmacy"]') },
    { at: 5.7, fn: (p) => tap(p, '.ctx[data-ctx="clinic"]') },
    { at: 9.2, fn: (p) => tap(p, '.ctx[data-ctx="home"]') },
  ] },

  { audio: '02', events: [
    { at: 0.3, fn: (p) => tap(p, '#stepIdle details:nth-of-type(1) > summary') },
    { at: 2.5, fn: (p) => scrollMainTo(p, 160) },
    { at: 5.5, fn: (p) => scrollMainTo(p, 320) },
    { at: 8.5, fn: (p) => scrollMainTo(p, 460) },
    { at: 11.5, fn: (p) => scrollMainTo(p, 620) },
    { at: 15.4, fn: async (p) => {
      await p.evaluate(() => { document.querySelectorAll('details.demo-controls')[0].open = false; });
      await scrollMainTo(p, 0, 3, 200);
    } },
  ] },

  // ---- scenario A: correct medicine, due now ----
  { audio: '10a', pre: async (p) => p.evaluate(() => {
      window.__holdSec = 7.0; window.__pauseSec = 4.6;
      document.getElementById('scenarioSelect').value = 'take_now';
    }),
    events: [ { at: 0.3, fn: (p) => tap(p, '#btnStart') } ] },
  { audio: '10b', events: [] },
  { audio: '10c', events: [ { at: 2.4, fn: (p) => tap(p, '#candidateList .candidate', 0) } ] }, // Metformin
  { audio: '10d', events: [] },
  { audio: '10e', events: [ { at: 0.3, fn: (p) => tap(p, '#btnToGuide') } ] },
  { audio: '10f', events: [ { at: 0.3, fn: (p) => tap(p, '#btnLog') } ] },

  // ---- quick, unnarrated re-scan beat ----
  { dur: 3.8, events: [
    { at: 0.2, fn: (p) => tap(p, '.tab[data-tab="scan"]') },
    { at: 0.5, fn: (p) => p.evaluate(() => {
        document.querySelectorAll('details.demo-controls')[1].open = true;
        document.getElementById('scenarioSelect').value = 'packaging_warning';
        document.querySelectorAll('details.demo-controls')[1].open = false;
        window.__holdSec = 1.0; window.__pauseSec = 0.6;
      }) },
    { at: 1.0, fn: (p) => tap(p, '#btnStart') },
    { at: 3.3, fn: (p) => tap(p, '#candidateList .candidate', 2) }, // Amoxicillin
  ] },

  // ---- scenario B: suspicious packaging ----
  { audio: '20a', events: [] },
  { audio: '20b', events: [ { at: 0.3, fn: (p) => tap(p, '#btnToGuide') } ] },
  { audio: '20c', events: [ { at: 0.3, fn: (p) => tap(p, '#btnLog') } ] },
];

// ---- runner ----------------------------------------------------------------------------
(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    defaultViewport: { width: 432, height: 936, deviceScaleFactor: 2.5 },
  });
  const page = await browser.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.evaluate(CURSOR_INJECT);
  await sleep(300);

  const client = await page.createCDPSession();
  const frames = [];
  let frameIdx = 0;
  client.on('Page.screencastFrame', async (f) => {
    const idx = frameIdx++;
    fs.writeFileSync(path.join(FRAMES_DIR, `f_${String(idx).padStart(6, '0')}.jpg`), Buffer.from(f.data, 'base64'));
    frames.push({ idx, t: Date.now() });
    await client.send('Page.screencastFrameAck', { sessionId: f.sessionId });
  });
  await client.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1080, maxHeight: 2340, everyNthFrame: 1 });
  const recordStart = Date.now();

  const audioPlacements = []; // { key, offsetSec }
  let cursor = 0;

  for (const phase of TIMELINE) {
    if (phase.pre) await phase.pre(page);
    const total = phase.dur != null ? phase.dur : withPad(phase.audio);
    if (phase.audio) audioPlacements.push({ key: phase.audio, offsetSec: cursor + LEAD });

    // Wall-clock accurate: each ev.fn (a real click/scroll) costs real time that a nominal
    // schedule can't predict, so re-measure "elapsed" from actual clock time after every step
    // rather than accumulating assumed durations — that mismatch is exactly what desynced the
    // app's own real-time internal timers from this script's schedule last run.
    const phaseWallStart = Date.now();
    for (const ev of (phase.events || []).slice().sort((a, b) => a.at - b.at)) {
      const elapsed = (Date.now() - phaseWallStart) / 1000;
      const wait = ev.at - elapsed;
      if (wait > 0) await sleep(wait * 1000);
      await ev.fn(page);
    }
    const remaining = total - (Date.now() - phaseWallStart) / 1000;
    if (remaining > 0) await sleep(remaining * 1000);
    cursor += (Date.now() - phaseWallStart) / 1000;
  }

  await client.send('Page.stopScreencast');
  await sleep(150);
  await browser.close();

  console.log('captured frames:', frames.length, 'timeline seconds:', cursor.toFixed(2));
  fs.writeFileSync(path.join(ROOT, 'audio_placements.json'), JSON.stringify({ placements: audioPlacements, totalSeconds: cursor }, null, 2));
  fs.writeFileSync(path.join(ROOT, 'frame_times.json'), JSON.stringify(frames));
})();

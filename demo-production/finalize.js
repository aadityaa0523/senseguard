// Turns the captured frame sequence + recorded audio-placement offsets into the final video:
//   1) variable-duration frame sequence -> CFR silent video (matches real wall-clock pacing)
//   2) narration lines placed at their recorded offsets -> one mixed track
//   3) mux, then append the existing static end-card segment
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = __dirname;
const FFMPEG = 'C:/Users/Aadityaa/AppData/Local/Temp/claude/C--Users-Aadityaa-iqoo/e1ab17ed-4d08-4c73-bf9c-ff8fc8560e80/scratchpad/tools/ffmpeg-master-latest-win64-gpl/bin/ffmpeg.exe';
const FFPROBE = FFMPEG.replace('ffmpeg.exe', 'ffprobe.exe');
const FRAMES_DIR = path.join(ROOT, 'frames');
const AUDIO_DIR = path.join(ROOT, 'shots', 'audio_el');

const { placements, totalSeconds } = JSON.parse(fs.readFileSync(path.join(ROOT, 'audio_placements.json')));
const frames = JSON.parse(fs.readFileSync(path.join(ROOT, 'frame_times.json')));

function run(args) { execFileSync(FFMPEG, args, { stdio: 'inherit' }); }
function probe(file) { return parseFloat(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim()); }

// ---- 1) frame sequence -> CFR video -----------------------------------------------------
const t0 = frames[0].t;
const rel = frames.map((f) => (f.t - t0) / 1000);
const lines = [];
for (let i = 0; i < frames.length; i++) {
  const file = path.join(FRAMES_DIR, `f_${String(frames[i].idx).padStart(6, '0')}.jpg`).replace(/\\/g, '/');
  const d = i < frames.length - 1 ? rel[i + 1] - rel[i] : Math.max(0.05, totalSeconds - rel[i]);
  lines.push(`file '${file}'`);
  lines.push(`duration ${d.toFixed(3)}`);
}
lines.push(`file '${path.join(FRAMES_DIR, `f_${String(frames[frames.length - 1].idx).padStart(6, '0')}.jpg`).replace(/\\/g, '/')}'`);
const concatList = path.join(ROOT, 'frames_list.txt');
fs.writeFileSync(concatList, lines.join('\n'));

// CDP screencast frames come out at CSS-pixel size (432x936), ignoring deviceScaleFactor —
// a Chrome screencast limitation, not a setting. Lanczos upscale to the delivery resolution.
const silentVideo = path.join(ROOT, 'silent_recording.mp4');
run(['-y', '-f', 'concat', '-safe', '0', '-i', concatList,
  '-vf', 'scale=1080:2340:flags=lanczos',
  '-r', '30', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
  '-t', totalSeconds.toFixed(2), silentVideo]);

// ---- 2) narration track: silence base + each line delayed to its recorded offset --------
const inputs = ['-f', 'lavfi', '-i', `anullsrc=r=44100:cl=stereo:d=${totalSeconds.toFixed(2)}`];
placements.forEach((p) => inputs.push('-i', path.join(AUDIO_DIR, `line_${p.key}.mp3`)));

const delayed = placements.map((p, i) => `[${i + 1}:a]adelay=${Math.round(p.offsetSec * 1000)}:all=1[d${i}]`);
const mixInputs = ['[0:a]', ...placements.map((_, i) => `[d${i}]`)].join('');
const filter = `${delayed.join(';')};${mixInputs}amix=inputs=${placements.length + 1}:duration=first:normalize=0[aout]`;

const narrationTrack = path.join(ROOT, 'narration_track.wav');
run(['-y', ...inputs, '-filter_complex', filter, '-map', '[aout]', '-t', totalSeconds.toFixed(2), narrationTrack]);

// ---- 3) mux body -------------------------------------------------------------------------
const bodyVideo = path.join(ROOT, 'demo_body.mp4');
run(['-y', '-i', silentVideo, '-i', narrationTrack, '-map', '0:v', '-map', '1:a',
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', bodyVideo]);

// ---- 4) build end-card segment (static image + its own line) and append ------------------
const endImg = path.join(ROOT, 'shots', '99_endcard.png');
const endAudio = path.join(AUDIO_DIR, 'line_end.mp3');
const endDur = probe(endAudio) + 0.5 + 0.6;
const endSeg = path.join(ROOT, 'endcard_seg.mp4');
run(['-y', '-loop', '1', '-i', endImg, '-i', endAudio,
  '-filter_complex', `[1:a]adelay=500:all=1,apad=pad_dur=3[a]`,
  '-map', '0:v', '-map', '[a]', '-t', endDur.toFixed(2),
  '-r', '30', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
  '-c:a', 'aac', '-b:a', '160k', endSeg]);

const finalList = path.join(ROOT, 'final_list.txt');
fs.writeFileSync(finalList, [bodyVideo, endSeg].map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n'));

const finalOut = path.join(ROOT, 'senseguard_demo_recorded.mp4');
run(['-y', '-f', 'concat', '-safe', '0', '-i', finalList,
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '160k', finalOut]);

console.log('FINAL:', finalOut);
